# 🎮 VERIDICAL - User Guide

## Quick Start

### 1. Connect Your Wallet
```
Click: "CONNECT WALLET" in top right
→ Select: Phantom or MetaMask
→ Approve: Chain switch to Monad Testnet
→ Status: Green indicator + wallet address shown
```

### 2. Explore Crime Records
```
Interactive Globe:
  • Rotate: Click + drag on globe
  • Zoom: Scroll wheel or buttons
  • Click hotspot: Opens detail panel
  
Timeline Panel:
  • Drag timeline: Jump to year
  • Filter: Select categories, severity
  • Search: Cmd+K keyboard shortcut
```

### 3. Submit Record to Blockchain
```
When record panel is open:
  1. Click: "Submit Record" button
  2. Approve: Transaction in wallet popup
  3. Wait: ~10-30 seconds for confirmation
  4. View: Receipt modal with full details
  5. Share: Copy explorer link or card
```

### 4. Upvote Records
```
For verified records:
  1. Click: "▲ Upvote Record (n)" button
  2. Approve: Transaction in wallet
  3. Confirm: Vote count updates
  4. Verify: See in transaction history
```

### 5. Check Transaction History
```
Click: "⛓ TRANSACTIONS" in header
  • View all submitted transactions
  • Check status (pending/success)
  • See gas costs
  • Click hash for explorer link
```

---

## 🛠️ Commands & Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Search records |
| `D` | Toggle documentary mode |
| `S` | Toggle statistics panel |
| `R` | Random crime discovery |
| `?` | Show keyboard help |
| `←` / `→` | Previous / Next crime |
| `Space` | Pause/resume globe rotation |
| `ESC` | Close all panels |

---

## 📊 Understanding the Interface

### Header
```
VERIDICAL (logo)
  │
  ├─ ▶ DOCUMENTARY     [Start guided tour]
  ├─ ⌖ SEARCH ⌘K      [Find records]
  ├─ ◈ CHAIN RECORDS   [Leaderboard]
  ├─ ◎ STATS           [Statistics]
  ├─ ◉ DISCOVER        [Random]
  └─ CONNECT WALLET    [Web3 integration]
```

### Globe View
```
Interactive 3D Earth
  ├─ 🔴 Red dots = Crime hotspots
  ├─ 🌐 Spinning = Living data visualization
  ├─ Zoom in/out = Explore regions
  └─ Click any dot = Open detail panel
```

### Record Detail Panel (Right Side)
```
┌─────────────────────────────────┐
│ BACK    RECORD DETAIL    ×      │ ← Header
├─────────────────────────────────┤
│ [CATEGORY TAG]                  │
│ Crime Title                     │
│ Year · Country                  │
│ ★★★★★ Severity                 │
├─────────────────────────────────┤
│ VICTIMS: ...                    │
│ PERPETRATORS: ...               │
│ SUMMARY: ...                    │
│ DETAIL: ...                     │
│ SOURCES: [links]                │
├─────────────────────────────────┤
│ MONAD RECORD                    │
│ [Submit Record Button]          │
│ [▲ Upvote Button]               │
│ [SHARE Button]                  │
│ [GENERATE CARD Button]          │
└─────────────────────────────────┘
```

### Transaction Receipt Modal
```
┌─────────────────────────────────┐
│ ✓ CONFIRMED                 ×   │
├─────────────────────────────────┤
│ Action:      📝 Submit Record   │
│ Hash:        0x1234...abcd      │
│ Block:       12,345             │
│ From:        0x5338...b5e       │
│ Gas Used:    75,432 units       │
│ Gas Price:   1.5 Gwei           │
│ Total Cost:  0.00112 MON        │
│ Time:        2:45:30 PM         │
├─────────────────────────────────┤
│ [View on Monad Explorer →]      │
│ [Close]                         │
└─────────────────────────────────┘
```

---

## 💰 Gas Costs on Monad

| Operation | Typical Gas | Estimated Cost |
|-----------|-------------|-----------------|
| Submit Record | 75-100k units | 0.001-0.005 MON |
| Upvote Record | 40-60k units | 0.0005-0.002 MON |
| Total for Test | 120-160k units | 0.002-0.007 MON |

**Note:** Monad Testnet has free faucet: https://testnet-faucet.monad.xyz

---

## 🔍 What Gets Recorded On-Chain

### Submit Record Stores:
```
✓ Event ID (crime identifier)
✓ Content Hash (keccak256 of crime data)
✓ Submitter Address (wallet)
✓ Block Number
✓ Timestamp
```

### Upvote Records:
```
✓ Event ID (which record)
✓ Voter Address (who upvoted)
✓ Vote Count (total votes)
✓ Block Number
✓ Timestamp
```

---

## 🚨 Troubleshooting

### "Contract not configured"
- ✅ Refresh page
- ✅ Check wallet is connected
- ✅ Verify on Monad Testnet (chain 10143)

### Wallet not detected
- ✅ Install Phantom: https://phantom.app
- ✅ Or MetaMask: https://metamask.io
- ✅ Enable "Ethereum" in Phantom settings

### Transaction stuck pending
- ✅ Wait 30-60 seconds
- ✅ Check Monad Explorer for tx hash
- ✅ Refresh page to see updated status

### Gas estimation failed
- ✅ Add MON to account via faucet
- ✅ Try submitting again
- ✅ Copy error message for support

---

## 📱 Mobile Support

✅ **Fully Responsive**
- Touch-friendly buttons
- Swipe to close panels
- Portrait & landscape modes
- Readable on all sizes

---

## 🌐 Network Information

```
Network: Monad Testnet
Chain ID: 10143
RPC: https://testnet-rpc.monad.xyz
Explorer: https://testnet.monadexplorer.com
Currency: MON (Monad)
Block Time: ~2 seconds
```

---

## 📞 Contact & Support

- **Deployed Contract:** [View on Explorer](https://testnet.monadexplorer.com/address/0x7aEbcBE903eE79B798a51d78F90017A985000BC1)
- **Monad Testnet:** https://docs.monad.xyz
- **GitHub:** https://github.com/monad-xyz

---

**Ready to record history? Start exploring! 🚀**
