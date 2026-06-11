// Central place for all external links + token info.
// Replace CURE_CA with the real pump.fun contract address at launch;
// while it equals the placeholder the UI shows a "TBA" state.
export const GITHUB_URL = 'https://github.com/thecurepay/curepay'
export const X_URL = 'https://x.com/Curepay'
export const DOCS_URL = 'https://github.com/thecurepay/curepay#readme'

export const CURE_CA = 'hsGdFj7bEwE43dvqErdofBRWKoxsRns3t4iJYWspump'
export const HAS_CA = CURE_CA !== 'YOUR_PUMPFUN_CA_HERE'
export const PUMP_URL = HAS_CA ? `https://pump.fun/coin/${CURE_CA}` : 'https://pump.fun'
export const DEX_URL = HAS_CA ? `https://dexscreener.com/solana/${CURE_CA}` : 'https://dexscreener.com'
