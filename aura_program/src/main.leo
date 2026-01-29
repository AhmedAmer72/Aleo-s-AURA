// Aura Protocol - Zero-Knowledge Proof of Income
// Minimal deployment version for Aleo Testnet

program aurazkpoinc.aleo {
    // CreditBadge - Private record proving income verification
    record CreditBadge {
        owner: address,
        income_bracket: u8,      // 1=Bronze, 2=Silver, 3=Gold
        expiry_timestamp: u32,
        nonce: field,
    }

    // Verify income and mint a CreditBadge (pure transition, no async)
    transition verify_income(
        domain_hash: u128,
        income_amount: u64,
        timestamp: u64
    ) -> CreditBadge {
        // Determine income bracket based on monthly income
        // Bronze: < 6250 (75k/12), Silver: < 12500 (150k/12), Gold: >= 12500
        let bracket: u8 = income_amount >= 12500u64 ? 3u8 : (income_amount >= 6250u64 ? 2u8 : 1u8);
        
        // Create expiry (1 year from now)
        let expiry: u32 = (timestamp as u32) + 31536000u32;
        
        // Generate nonce
        let nonce_val: field = BHP256::hash_to_field(domain_hash);
        
        return CreditBadge {
            owner: self.caller,
            income_bracket: bracket,
            expiry_timestamp: expiry,
            nonce: nonce_val,
        };
    }

    // Get tier from badge (returns badge back + tier)
    transition get_tier(badge: CreditBadge) -> (CreditBadge, u8) {
        return (badge, badge.income_bracket);
    }
}
