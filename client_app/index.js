import {Account, initThreadPool, ProgramManager, AleoKeyProvider, AleoKeyProviderParams} from "@aleohq/sdk";

await initThreadPool();

const token_program =
    "program token.aleo;\n" +
    "\n" +
    "struct UserProfile:"+ 
        "user_profile as address;\n"+
        "signal as u64;\n" +
    "mapping profile:\n"+
        "key as address.public;\n"+
        "value as UserProfile.public;\n"+
    "function set_user_profile:\n" +
    "    input r0 as address.public;\n" +
    "    input r1 as UserProfile.public;\n" +
    "    async set_user_profile r0 r1 into r2;\n" +
    "    output r2 as token.aleo/set_user_profile.future;\n"+
    "finalize set_user_profile:"+
        "input r0 as address.public;\n"+
        "input r1 as UserProfile.public;\n"+
        "set r1 into profile[r0];\n";

async function localProgramExecution(program, aleoFunction, inputs) {
    const programManager = new ProgramManager();

    // Create a temporary account for the execution of the program
    const account = new Account();
    programManager.setAccount(account);

    // Create a key provider in order to re-use the same key for each execution
    const keyProvider = new AleoKeyProvider();
    keyProvider.useCache(true);
    programManager.setKeyProvider(keyProvider);

    // Pre-synthesize the program keys and then cache them in memory using key provider
    const keyPair = await programManager.synthesizeKeys(token_program, "set_user_profile", ["aleo12ayekfmpzfvsq3gq5smnvgtsh7pskwg3nfcht5nmxh6m5ayywygs52yshu", "{user_profile: aleo12ayekfmpzfvsq3gq5smnvgtsh7pskwg3nfcht5nmxh6m5ayywygs52yshu, signal: 24u64}"]);
    programManager.keyProvider.cacheKeys("token.aleo:set_user_profile", keyPair);

    // Specify parameters for the key provider to use search for program keys. In particular specify the cache key
    // that was used to cache the keys in the previous step.
    const keyProviderParams = new AleoKeyProviderParams({cacheKey: "token.aleo:set_user_profile"});

    // Execute once using the key provider params defined above. This will use the cached proving keys and make
    // execution significantly faster.
    let executionResponse = await programManager.run(
        token_program,
        "set_user_profile",
        ["aleo12ayekfmpzfvsq3gq5smnvgtsh7pskwg3nfcht5nmxh6m5ayywygs52yshu", "{user_profile: aleo12ayekfmpzfvsq3gq5smnvgtsh7pskwg3nfcht5nmxh6m5ayywygs52yshu, signal: 24u64}"],
        true,
        undefined,
        keyProviderParams,
    );
    console.log("token/set_user_profile executed - result:", executionResponse.getOutputs());

    // Verify the execution using the verifying key that was generated earlier.
    if (programManager.verifyExecution(executionResponse)) {
        console.log("token/set_user_profile execution verified!");
    } else {
        throw("Execution failed verification!");
    }
}

const start = Date.now();
console.log("Starting execute!");
await localProgramExecution();
console.log("Execute finished!", Date.now() - start);
