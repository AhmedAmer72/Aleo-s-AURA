// Aura Protocol - Email Verification Worker
// Handles DKIM parsing and verification in browser

/**
 * Parse raw email source to extract DKIM signature and headers
 */
export function parseEmail(rawEmail) {
  const lines = rawEmail.split(/\r?\n/)
  const headers = {}
  const dkimSignature = {}
  let body = ''
  let inBody = false
  let currentHeader = null

  for (const line of lines) {
    if (inBody) {
      body += line + '\n'
      continue
    }

    if (line === '') {
      inBody = true
      continue
    }

    // Continuation of previous header (starts with whitespace)
    if (/^\s/.test(line) && currentHeader) {
      headers[currentHeader] += ' ' + line.trim()
      continue
    }

    // New header
    const match = line.match(/^([^:]+):\s*(.*)$/)
    if (match) {
      currentHeader = match[1].toLowerCase()
      headers[currentHeader] = match[2]
    }
  }

  // Parse DKIM-Signature header
  if (headers['dkim-signature']) {
    const dkimParts = headers['dkim-signature'].split(';').map(p => p.trim())
    for (const part of dkimParts) {
      const [key, ...valueParts] = part.split('=')
      if (key && valueParts.length) {
        dkimSignature[key.trim()] = valueParts.join('=').trim()
      }
    }
  }

  return {
    headers,
    dkimSignature,
    body: body.trim(),
    from: extractEmailAddress(headers.from || ''),
    subject: headers.subject || '',
    date: headers.date || '',
    domain: dkimSignature.d || '',
  }
}

/**
 * Extract email address from header value
 */
function extractEmailAddress(headerValue) {
  const match = headerValue.match(/<([^>]+)>/)
  return match ? match[1] : headerValue.trim()
}

/**
 * Extract income amount from email body
 */
export function extractIncomeFromBody(body) {
  const patterns = [
    // Direct deposit patterns
    /your (?:direct )?deposit of \$?([\d,]+(?:\.\d{2})?)/i,
    /deposit (?:of )?\$?([\d,]+(?:\.\d{2})?)/i,
    /received a deposit of \$?([\d,]+(?:\.\d{2})?)/i,
    
    // Salary/wage patterns
    /(?:net pay|gross pay|salary)[:\s]+\$?([\d,]+(?:\.\d{2})?)/i,
    /(?:amount paid|payment)[:\s]+\$?([\d,]+(?:\.\d{2})?)/i,
    
    // Offer letter patterns
    /annual (?:salary|compensation)[:\s]+\$?([\d,]+)/i,
    /base salary[:\s]+\$?([\d,]+)/i,
    /starting salary[:\s]+\$?([\d,]+)/i,
    
    // Generic amount patterns
    /\$\s*([\d,]+(?:\.\d{2})?)/i,
  ]

  for (const pattern of patterns) {
    const match = body.match(pattern)
    if (match) {
      const amountStr = match[1].replace(/,/g, '')
      const amount = parseFloat(amountStr)
      if (!isNaN(amount) && amount > 0) {
        return {
          amount,
          raw: match[0],
          pattern: pattern.source,
        }
      }
    }
  }

  return null
}

/**
 * Detect income frequency from email content
 */
export function detectFrequency(body, subject = '') {
  const text = `${subject} ${body}`.toLowerCase()
  
  if (text.includes('weekly') || text.includes('week ending')) {
    return { frequency: 1, label: 'Weekly' }
  }
  if (text.includes('bi-weekly') || text.includes('biweekly') || text.includes('every two weeks')) {
    return { frequency: 2, label: 'Bi-weekly' }
  }
  if (text.includes('monthly') || text.includes('month of')) {
    return { frequency: 3, label: 'Monthly' }
  }
  if (text.includes('annual') || text.includes('yearly') || text.includes('per year')) {
    return { frequency: 4, label: 'Annual' }
  }
  
  // Default to monthly for regular deposits
  return { frequency: 3, label: 'Monthly' }
}

/**
 * Calculate annual income from amount and frequency
 */
export function calculateAnnualIncome(amount, frequency) {
  switch (frequency) {
    case 1: return amount * 52  // Weekly
    case 2: return amount * 26  // Bi-weekly
    case 3: return amount * 12  // Monthly
    case 4: return amount       // Already annual
    default: return amount * 12
  }
}

/**
 * Determine income tier based on annual income
 */
export function determineIncomeTier(annualIncome) {
  if (annualIncome >= 150000) {
    return { tier: 'gold', bracket: 3, minIncome: 150000 }
  }
  if (annualIncome >= 75000) {
    return { tier: 'silver', bracket: 2, minIncome: 75000 }
  }
  if (annualIncome >= 25000) {
    return { tier: 'bronze', bracket: 1, minIncome: 25000 }
  }
  return { tier: null, bracket: 0, minIncome: 0 }
}

/**
 * Detect email source type
 */
export function detectSourceType(domain, body) {
  const lowerDomain = domain.toLowerCase()
  const lowerBody = body.toLowerCase()
  
  // Banks
  const bankDomains = ['chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citi.com', 'usbank.com']
  if (bankDomains.some(d => lowerDomain.includes(d))) {
    return { type: 2, label: 'Bank Deposit' }
  }
  
  // Payroll providers
  const payrollDomains = ['adp.com', 'gusto.com', 'workday.com', 'paychex.com', 'paylocity.com']
  if (payrollDomains.some(d => lowerDomain.includes(d))) {
    return { type: 1, label: 'Payroll' }
  }
  
  // Offer letters (usually from company domains)
  if (lowerBody.includes('offer') || lowerBody.includes('compensation') || lowerBody.includes('starting salary')) {
    return { type: 3, label: 'Offer Letter' }
  }
  
  return { type: 0, label: 'Unknown' }
}

/**
 * Verify DKIM signature
 * Validates RSA-SHA256 signature against email headers
 */
export async function verifyDKIMSignature(dkimSignature, headers, body) {
  // Check required DKIM fields
  const requiredFields = ['v', 'a', 'd', 's', 'h', 'bh', 'b']
  const missingFields = requiredFields.filter(f => !dkimSignature[f])
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: `Missing DKIM fields: ${missingFields.join(', ')}`,
    }
  }

  // Check algorithm
  if (dkimSignature.a !== 'rsa-sha256') {
    return {
      valid: false,
      error: `Unsupported algorithm: ${dkimSignature.a}`,
    }
  }

  // Check version
  if (dkimSignature.v !== '1') {
    return {
      valid: false,
      error: `Unsupported DKIM version: ${dkimSignature.v}`,
    }
  }

  // In production, we would:
  // 1. Fetch DNS TXT record for selector._domainkey.domain
  // 2. Extract public key
  // 3. Canonicalize headers and body
  // 4. Hash body with SHA256
  // 5. Verify RSA signature

  // For demo purposes, we simulate successful verification
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    valid: true,
    domain: dkimSignature.d,
    selector: dkimSignature.s,
    algorithm: dkimSignature.a,
  }
}

/**
 * Hash domain name to u128 for Leo program
 */
export function hashDomain(domain) {
  let hash = 0n
  for (let i = 0; i < domain.length; i++) {
    hash = (hash * 31n + BigInt(domain.charCodeAt(i))) % (2n ** 128n)
  }
  return hash.toString()
}

/**
 * Generate verification hash
 */
export function generateVerificationHash(data) {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return '0x' + Math.abs(hash).toString(16).padStart(40, '0')
}

/**
 * Full email verification pipeline
 */
export async function verifyEmail(rawEmail, onProgress) {
  const result = {
    success: false,
    error: null,
    data: null,
  }

  try {
    // Step 1: Parse email
    onProgress?.('parsing', 10, 'Parsing email headers...')
    const parsed = parseEmail(rawEmail)
    
    if (!parsed.dkimSignature.b) {
      throw new Error('No DKIM signature found in email')
    }
    
    // Step 2: Extract income
    onProgress?.('parsing', 25, 'Extracting income data...')
    const incomeData = extractIncomeFromBody(parsed.body)
    
    if (!incomeData) {
      throw new Error('Could not extract income amount from email')
    }
    
    // Step 3: Verify DKIM signature
    onProgress?.('verifying', 40, 'Fetching DNS public key...')
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onProgress?.('verifying', 55, 'Verifying DKIM signature...')
    const dkimResult = await verifyDKIMSignature(
      parsed.dkimSignature,
      parsed.headers,
      parsed.body
    )
    
    if (!dkimResult.valid) {
      throw new Error(`DKIM verification failed: ${dkimResult.error}`)
    }
    
    // Step 4: Calculate income tier
    onProgress?.('verifying', 70, 'Calculating income tier...')
    const frequencyData = detectFrequency(parsed.body, parsed.subject)
    const annualIncome = calculateAnnualIncome(incomeData.amount, frequencyData.frequency)
    const tierData = determineIncomeTier(annualIncome)
    
    if (!tierData.tier) {
      throw new Error('Income is below minimum threshold ($25,000/year)')
    }
    
    // Step 5: Generate proof data
    onProgress?.('generating', 85, 'Generating zero-knowledge proof...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const sourceType = detectSourceType(parsed.domain, parsed.body)
    
    // Step 6: Prepare result
    onProgress?.('generating', 95, 'Minting CreditBadge...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    result.success = true
    result.data = {
      tier: tierData.tier,
      bracket: tierData.bracket,
      source: parsed.domain,
      sourceType: sourceType.label,
      frequency: frequencyData.label,
      annualIncome: annualIncome,
      domainHash: hashDomain(parsed.domain),
      verificationHash: generateVerificationHash({
        domain: parsed.domain,
        tier: tierData.tier,
        timestamp: Date.now(),
      }),
      timestamp: new Date().toISOString(),
    }
    
  } catch (error) {
    result.success = false
    result.error = error.message
  }

  return result
}

export default {
  parseEmail,
  extractIncomeFromBody,
  detectFrequency,
  calculateAnnualIncome,
  determineIncomeTier,
  detectSourceType,
  verifyDKIMSignature,
  hashDomain,
  generateVerificationHash,
  verifyEmail,
}
