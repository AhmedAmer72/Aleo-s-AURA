// Aura Protocol V2 - Zero-Knowledge Proof of Income
// Full-featured DeFi lending protocol on Aleo

program aurav2zkp.aleo {
    
    // ============================================
    // RECORDS - Private State
    // ============================================
    
    // CreditBadge - Proves income tier without revealing exact amount
    record CreditBadge {
        owner: address,
        income_bracket: u8,      // 1=Bronze (<$75k), 2=Silver ($75k-$150k), 3=Gold (>$150k)
        expiry_timestamp: u32,   // Unix timestamp when badge expires
        nonce: field,            // Unique identifier
    }
    
    // LoanPosition - Tracks an active loan
    record LoanPosition {
        owner: address,
        principal: u64,          // Original loan amount in microcredits
        interest_rate: u16,      // Interest rate in basis points (e.g., 600 = 6%)
        start_timestamp: u32,    // When loan was issued
        pool_id: u8,             // Which pool funded the loan
        nonce: field,
    }
    
    // LPToken - Liquidity Provider token for pool deposits
    record LPToken {
        owner: address,
        amount: u64,             // Amount of LP tokens
        pool_id: u8,             // Which pool this is for
        deposit_timestamp: u32,  // When deposited
        nonce: field,
    }
    
    // ============================================
    // MAPPINGS - Public State
    // ============================================
    
    // Total liquidity in each pool (pool_id => total_liquidity)
    mapping pool_liquidity: u8 => u64;
    
    // Utilized liquidity in each pool (pool_id => utilized)
    mapping pool_utilized: u8 => u64;
    
    // Total LP tokens issued per pool (pool_id => total_lp_tokens)
    mapping pool_lp_supply: u8 => u64;
    
    // Pool interest rates in basis points (pool_id => rate)
    mapping pool_rates: u8 => u16;
    
    // Total loans issued count
    mapping total_loans: u8 => u64;
    
    // Total verifications count
    mapping total_verifications: u8 => u64;
    
    // ============================================
    // INCOME VERIFICATION
    // ============================================
    
    // Verify income and mint a CreditBadge
    transition verify_income(
        domain_hash: u128,      // Hash of email domain for verification
        income_amount: u64,     // Monthly income in cents
        timestamp: u64          // Current timestamp
    ) -> CreditBadge {
        // Determine income bracket based on monthly income
        // Bronze: < $6,250/month (~$75k/year)
        // Silver: $6,250 - $12,500/month (~$75k-$150k/year)
        // Gold: > $12,500/month (~$150k+/year)
        let bracket: u8 = 1u8;
        if income_amount >= 12500u64 {
            bracket = 3u8;
        } else {
            if income_amount >= 6250u64 {
                bracket = 2u8;
            }
        }
        
        // Badge expires in 1 year (31536000 seconds)
        let expiry: u32 = timestamp as u32 + 31536000u32;
        
        // Generate unique nonce from inputs
        let nonce_val: field = BHP256::hash_to_field(domain_hash);
        
        return CreditBadge {
            owner: self.caller,
            income_bracket: bracket,
            expiry_timestamp: expiry,
            nonce: nonce_val,
        };
    }
    
    // Get the tier from a badge (returns badge + tier for verification)
    transition get_tier(badge: CreditBadge) -> (CreditBadge, u8) {
        return (badge, badge.income_bracket);
    }
    
    // Renew an expired badge (requires re-verification in production)
    transition renew_badge(
        old_badge: CreditBadge,
        new_timestamp: u64
    ) -> CreditBadge {
        // Verify caller owns the badge
        assert_eq(old_badge.owner, self.caller);
        
        // Extend expiry by 1 year
        let new_expiry: u32 = new_timestamp as u32 + 31536000u32;
        
        // Generate new nonce
        let new_nonce: field = BHP256::hash_to_field(old_badge.nonce);
        
        return CreditBadge {
            owner: self.caller,
            income_bracket: old_badge.income_bracket,
            expiry_timestamp: new_expiry,
            nonce: new_nonce,
        };
    }
    
    // ============================================
    // LENDING FUNCTIONS
    // ============================================
    
    // Request a loan using CreditBadge as proof of income
    // Note: In a full implementation, this would interact with credits.aleo
    transition request_loan(
        badge: CreditBadge,
        amount: u64,            // Loan amount in microcredits
        pool_id: u8,            // Which pool to borrow from
        current_time: u32       // Current timestamp
    ) -> (CreditBadge, LoanPosition) {
        // Verify caller owns the badge
        assert_eq(badge.owner, self.caller);
        
        // Verify badge hasn't expired
        assert(badge.expiry_timestamp > current_time);
        
        // Verify tier meets minimum (pool 1=gold, 2=silver, 3=bronze)
        // Pool 1 (Gold) requires tier 3
        // Pool 2 (Silver) requires tier 2+
        // Pool 3 (Bronze) requires tier 1+
        let required_tier: u8 = 1u8;
        if pool_id == 1u8 {
            required_tier = 3u8;
        } else {
            if pool_id == 2u8 {
                required_tier = 2u8;
            }
        }
        assert(badge.income_bracket >= required_tier);
        
        // Set interest rate based on pool
        // Pool 1 (Gold): 6%, Pool 2 (Silver): 9%, Pool 3 (Bronze): 12%
        let rate: u16 = 1200u16;
        if pool_id == 1u8 {
            rate = 600u16;
        } else {
            if pool_id == 2u8 {
                rate = 900u16;
            }
        }
        
        // Generate loan nonce
        let loan_nonce: field = BHP256::hash_to_field(badge.nonce);
        
        // Create loan position
        let loan: LoanPosition = LoanPosition {
            owner: self.caller,
            principal: amount,
            interest_rate: rate,
            start_timestamp: current_time,
            pool_id: pool_id,
            nonce: loan_nonce,
        };
        
        // Return badge (not consumed) + loan
        return (badge, loan);
    }
    
    // Repay a loan (simplified - in production would handle credits transfer)
    transition repay_loan(
        loan: LoanPosition,
        payment_amount: u64     // Amount being repaid in microcredits
    ) -> bool {
        // Verify caller owns the loan
        assert_eq(loan.owner, self.caller);
        
        // Calculate total owed (principal + interest)
        let interest: u64 = (loan.principal * (loan.interest_rate as u64)) / 10000u64;
        let total_owed: u64 = loan.principal + interest;
        
        // Verify payment covers full amount
        assert(payment_amount >= total_owed);
        
        // Loan is repaid (record consumed)
        return true;
    }
    
    // ============================================
    // LIQUIDITY PROVIDER FUNCTIONS
    // ============================================
    
    // Deposit credits to a lending pool
    transition deposit_to_pool(
        amount: u64,
        pool_id: u8,
        current_time: u32
    ) -> LPToken {
        // Verify valid pool
        assert(pool_id >= 1u8);
        assert(pool_id <= 3u8);
        
        // Generate LP token nonce
        let lp_nonce: field = BHP256::hash_to_field(amount as field);
        
        // Create LP token (1:1 with deposit for simplicity)
        let lp_token: LPToken = LPToken {
            owner: self.caller,
            amount: amount,
            pool_id: pool_id,
            deposit_timestamp: current_time,
            nonce: lp_nonce,
        };
        
        return lp_token;
    }
    
    // Withdraw from a lending pool by burning LP tokens
    transition withdraw_from_pool(
        lp_token: LPToken
    ) -> u64 {
        // Verify caller owns the LP token
        assert_eq(lp_token.owner, self.caller);
        
        // Return the amount (LP token is consumed/burned)
        return lp_token.amount;
    }
    
    // ============================================
    // VIEW FUNCTIONS (Read-only transitions)
    // ============================================
    
    // Check if a badge is still valid
    transition is_badge_valid(
        badge: CreditBadge,
        current_timestamp: u32
    ) -> (CreditBadge, bool) {
        let is_valid: bool = badge.expiry_timestamp > current_timestamp;
        return (badge, is_valid);
    }
    
    // Calculate interest owed on a loan
    transition calculate_interest(
        loan: LoanPosition
    ) -> (LoanPosition, u64) {
        let interest: u64 = (loan.principal * (loan.interest_rate as u64)) / 10000u64;
        return (loan, interest);
    }
    
    // Get loan details
    transition get_loan_details(
        loan: LoanPosition
    ) -> (LoanPosition, u64, u16, u8) {
        return (loan, loan.principal, loan.interest_rate, loan.pool_id);
    }
    
    // Get LP token details
    transition get_lp_details(
        lp_token: LPToken
    ) -> (LPToken, u64, u8) {
        return (lp_token, lp_token.amount, lp_token.pool_id);
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    @noupgrade
    async constructor() {}
}
