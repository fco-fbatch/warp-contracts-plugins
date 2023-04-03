import { WarpPlugin, WarpPluginType } from 'warp-contracts';

export class ContractBlacklistPlugin implements WarpPlugin<string, Promise<boolean>> {
  constructor(private blacklistFunction: (input: string) => Promise<boolean>) {}

  async process(input: string): Promise<boolean> {
    return await this.blacklistFunction(input);
  }

  type(): WarpPluginType {
    return 'contract-blacklist';
  }
}

export async function getBlacklistFunction(nodeDb: any, maxFailures: number) {
  return async (input: string) => {
    try {
      const result = await nodeDb('black_list')
        .where({
          contract_tx_id: input
        })
        .first('failures');

      const failures = result.failures;
      return Number.isInteger(failures) && failures > maxFailures - 1;
    } catch (e) {
      throw new Error(`Unable to check blacklist for contract: ${input}: ${JSON.stringify(e)}`);
    }
  };
}
