# Aura Protocol - Leo Program

This directory contains the Leo smart contracts for the Aura Protocol.

## Structure

- `src/main.leo` - Main Aura protocol implementation
- `program.json` - Program configuration
- `.env.example` - Environment variables template

## Features

### Records (Private State)
- **CreditBadge**: Private record proving income verification without revealing actual income
- **LoanPosition**: Private record representing an active loan

### Mappings (Public State)
- `verification_count`: Track verifications per income tier
- `pool_liquidity`: Lending pool liquidity tracking
- `verified_domains`: Registered DKIM domain public keys
- `public_credit_scores`: Optional public credit scores

### Key Transitions

1. **verify_income**: Verify email-based income and mint private CreditBadge
2. **verify_income_public**: Verify income with public credit score recording
3. **request_loan**: Request a loan using CreditBadge as collateral
4. **repay_loan**: Repay an active loan
5. **transfer_badge**: Transfer badge ownership (composability)

## Income Brackets

| Tier | Badge | Annual Income | Max Loan Multiplier |
|------|-------|---------------|---------------------|
| 3 | Gold 🥇 | $150,000+ | 3x ($30k) |
| 2 | Silver 🥈 | $75,000+ | 2x ($20k) |
| 1 | Bronze 🥉 | $25,000+ | 1x ($10k) |

## Building

```bash
# Install Leo
curl -sSL https://install.leo-lang.org | bash

# Navigate to program directory
cd aura_program

# Build the program
leo build

# Run tests
leo run verify_income "{amount_cents: 10000000u64, frequency: 4u8, source_type: 1u8}" 12345u128 "{r_component: 1field, s_component: 1field, domain_hash: 12345u128}" 1704067200u32 1field
```

## Deployment

```bash
# Set up environment
cp .env.example .env
# Edit .env with your private key

# Deploy to testnet
leo deploy
```

## Technical Notes

### DKIM Verification (Future Implementation)
The current implementation uses simplified signature verification. Full DKIM support requires:
1. RSA-SHA256 signature verification in ZK
2. DNS TXT record public key verification
3. Email header parsing within the circuit

### Security Considerations
- Badge expiry enforced at 1 year
- Ownership verification on all operations
- Rate limiting via gas costs
- Domain whitelist for trusted email providers
