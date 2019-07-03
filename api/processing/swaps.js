/* eslint-disable no-else-return */
import config from 'config';
import { db, SWAP_TYPE } from '../utils';
import { bnb, loki } from '../helpers';

// The fee charged for withdrawing loki
const lokiWithdrawalFee = config.get('loki.withdrawalFee');

/**
 * Process any pending swaps and send out the coins.
 *
 * @param {string} swapType The type of swap.
 */
export async function processSwaps(swapType) {
  if (!swapType) {
    console.error('Swap type must not be null or undefined.');
    return;
  }

  const swaps = await db.getPendingSwaps(swapType);
  const ids = swaps.map(s => s.uuid);
  const transactions = getTransactions(swaps);

  if (!transactions || transactions.length === 0) {
    console.info(`No swaps found for ${swapType}`);
    return;
  }

  try {
    const txHashes = await send(swapType, transactions);
    await db.updateSwapsTransferTransactionHash(ids, txHashes.join(','));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

/**
 * Take an array of `swaps` and combine the ones going to the same `address`.
 *
 * @param {[{ amount, address: string }]} swaps An array of swaps.
 * @returns Simplified transactions from the swaps.
 */
export function getTransactions(swaps) {
  const amounts = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const swap of swaps) {
    if (swap.address in amounts) {
      amounts[swap.address] += parseFloat(swap.amount) || 0;
    } else {
      amounts[swap.address] = parseFloat(swap.amount) || 0;
    }
  }

  return Object.keys(amounts).map(k => ({ address: k, amount: amounts[k] }));
}

/**
 * Send the given `swaps`.
 *
 * @param {string} swapType The type of swap.
 * @param {[{ address: string, amount: number }]} transactions An array of transactions.
 * @returns An array of transaction hashes
 */
export async function send(swapType, transactions) {
  // Multi-send always returns an array of hashes
  if (swapType === SWAP_TYPE.LOKI_TO_BLOKI) {
    const symbol = config.get('binance.symbol');
    const outputs = transactions.map(({ address, amount }) => ({
      to: address,
      coins: [{
        denom: symbol,
        amount,
      }],
    }));

    // Send BNB to the users
    return bnb.multiSend(config.get('binance.wallet.mnemonic'), outputs, 'Loki Bridge');
  } else if (swapType === SWAP_TYPE.BLOKI_TO_LOKI) {
    // Deduct the loki withdrawal fees
    const outputs = transactions.map(({ address, amount }) => {
      const fee = (parseFloat(lokiWithdrawalFee) * 1e9).toFixed(0);
      return {
        address,
        amount: Math.max(0, amount - fee),
      };
    });

    // Send Loki to the users
    return loki.multiSend(outputs);
  }

  throw new Error('Invalid swap type');
}
