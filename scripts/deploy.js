#!/usr/bin/env node
/**
 * Aura Protocol - Deployment Script
 * Uses the Provable SDK to deploy the contract to Aleo Testnet
 */

// Note: For testnet, we import from @provablehq/sdk/testnet.js
import {
  Account,
  ProgramManager,
  AleoKeyProvider,
  NetworkRecordProvider,
  AleoNetworkClient,
} from "@provablehq/sdk/testnet.js";

// Configuration
const PRIVATE_KEY = "APrivateKey1zkpFPh4saNYq4Ut1bFPFveYZGDKhYQ2yWv5xH8crXHG7xVL";
const NETWORK_URL = "https://api.explorer.provable.com/v1";
const PRIORITY_FEE = 5.0; // 5 credits priority fee

// Minimal Aura Protocol contract source code
const PROGRAM_SOURCE = `program aurazkpoinc.aleo {
    record CreditBadge {
        owner: address,
        income_bracket: u8,
        expiry_timestamp: u32,
        nonce: field,
    }
    
    transition verify_income(domain_hash: u128, income_amount: u64, timestamp: u64) -> CreditBadge {
        let annual_income: u64 = income_amount * 12u64;
        
        let tier: u8 = 1u8;
        if annual_income >= 15000000u64 {
            tier = 3u8;
        } else if annual_income >= 7500000u64 {
            tier = 2u8;
        }
        
        let expiry: u32 = (timestamp + 31536000u64) as u32;
        let badge_nonce: field = BHP256::hash_to_field(self.caller);
        
        return CreditBadge {
            owner: self.caller,
            income_bracket: tier,
            expiry_timestamp: expiry,
            nonce: badge_nonce,
        };
    }
    
    transition get_tier(badge: CreditBadge) -> (CreditBadge, u8) {
        let new_badge: CreditBadge = CreditBadge {
            owner: badge.owner,
            income_bracket: badge.income_bracket,
            expiry_timestamp: badge.expiry_timestamp,
            nonce: badge.nonce,
        };
        return (new_badge, badge.income_bracket);
    }
}`;

async function deploy() {
  console.log("🚀 Aura Protocol Deployment Script");
  console.log("===================================\n");

  try {
    // Create account from private key
    console.log("📦 Setting up account...");
    const account = new Account({ privateKey: PRIVATE_KEY });
    console.log(`   Address: ${account.address()}`);

    // Create network client
    console.log("\n🌐 Connecting to Aleo Testnet...");
    const networkClient = new AleoNetworkClient(NETWORK_URL);
    
    // Check balance
    const balance = await networkClient.getAccount(account.address());
    console.log(`   Balance: ${balance} microcredits`);

    // Create key provider
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);

    // Create record provider
    const recordProvider = new NetworkRecordProvider(account, networkClient);

    // Create program manager
    console.log("\n⚙️  Initializing Program Manager...");
    const programManager = new ProgramManager(
      NETWORK_URL,
      keyProvider,
      recordProvider
    );
    programManager.setAccount(account);

    // Check if program already exists
    console.log("\n🔍 Checking if program already exists...");
    try {
      const existingProgram = await networkClient.getProgram("aurazkpoinc.aleo");
      if (existingProgram) {
        console.log("   ⚠️  Program already deployed!");
        console.log("\n   Program Source:");
        console.log(existingProgram.slice(0, 200) + "...");
        return;
      }
    } catch (e) {
      console.log("   ✓ Program not found - proceeding with deployment");
    }

    // Deploy the program
    console.log("\n📤 Deploying program...");
    console.log(`   Priority Fee: ${PRIORITY_FEE} credits`);
    console.log("   This may take a few minutes...\n");

    const txId = await programManager.deploy(
      PROGRAM_SOURCE,
      PRIORITY_FEE,  // priority fee in credits
      false,         // use public fee (not private record)
      undefined,     // record search params
      undefined,     // fee record
      undefined      // private key (already set via setAccount)
    );

    console.log("✅ Deployment transaction submitted!");
    console.log(`   Transaction ID: ${txId}`);
    console.log(`\n   View on explorer:`);
    console.log(`   https://testnet.aleoscan.io/transaction?id=${txId}`);

    // Wait and verify
    console.log("\n⏳ Waiting for confirmation (30s)...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      const tx = await networkClient.getTransaction(txId);
      if (tx) {
        console.log("✅ Transaction confirmed!");
        console.log(`   Status: ${tx.status || "confirmed"}`);
      }
    } catch (e) {
      console.log("⏳ Transaction still pending. Check explorer for status.");
    }

    // Verify program deployment
    try {
      const program = await networkClient.getProgram("aurazkpoinc.aleo");
      if (program) {
        console.log("\n🎉 Program successfully deployed!");
        console.log("   Program ID: aurazkpoinc.aleo");
      }
    } catch (e) {
      console.log("\n⏳ Program not yet visible. It may take a few more blocks.");
    }

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message || error);
    
    if (error.message?.includes("insufficient")) {
      console.log("\n💡 Tip: Make sure you have enough credits in your account.");
      console.log("   You can get testnet credits from the Aleo faucet.");
    }
  }
}

// Run deployment
deploy().catch(console.error);
