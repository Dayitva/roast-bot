import { Button, Frog, TextInput, parseEther } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";
import fetch from 'node-fetch';

const contractAddress = "0xcfA132E353cB4E398080B9700609bb008eceB125";
const botAddress = "0x327470ee862e4778c9d3864f89a3eec87bbdd1dd";
const superTokenAddress = "0x143ea239159155b408e71cdbe836e8cfd6766732";
// const flowRate = 766495000;

const firebaseConfig = {
  databaseURL: "https://reclaim-b8378-default-rtdb.firebaseio.com/",
};

const firebaseapp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseapp);

async function writeRoastData(roastId: number, roaster: string, roastee: string, flowrate: number) {
  await set(ref(db, 'roasts/' + roastId), {
    roaster: roaster,
    roastee: roastee,
    flowrate: flowrate
  });
}

async function readRoastData(roastId: any) {
  try {
    const snapshot = await get(child(ref(db), `roasts/${roastId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getUsernameFromFID(fid: number): Promise<string | null> {
  try {
    console.log("Fetching profile for FID:", fid);
    const response = await fetch(`https://searchcaster.xyz/api/profiles?fid=${fid}`);
    const data: { body: { username: string } }[] = await (response.json() as any);
    console.log(data[0].body.username);
    if (data && data[0].body) {
      return data[0].body.username;
    } else {
      console.log("No profile found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

const cfa_abi = [
  {
      inputs: [
          { internalType: "contract ISuperToken", name: "token", type: "address" },
          { internalType: "address", name: "receiver", type: "address" },
          { internalType: "int96", name: "flowrate", type: "int96" }
      ],
      name: 'setFlowrate',
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: 'nonpayable',
      type: 'function',
  },
]

const iseth_abi = [
  {
    inputs: [],
    name: "upgradeByETH",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
]

// Uncomment to use Edge Runtime.
// export const config = {
//   runtime: 'edge',
// }

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'Super Roast',
})

app.frame('/', async (c) => {
  const { status } = c;
  const data = await readRoastData(1);
  console.log(data.roaster, data.roastee, data.flowrate);
  return c.res({
    action: '/finish',
    image: (
      <div
        style={{
          alignItems: 'center',
          background:
            status === 'response'
              ? 'linear-gradient(to right, #432889, #17101F)'
              : 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`${data.roaster} is paying ${(data.flowrate*(30*24*3600)/10**18).toFixed(4)} ETH per month to currently roast ${data.roastee}. Pay more to roast someone else.\n You can upgrade first if you don't have ETHx.`} 
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Type Farcaster username to roast" />,
      <Button.Transaction target="/upgrade">Upgrade</Button.Transaction>,
      <Button.Transaction target="/roast">Roast</Button.Transaction>,
    ],
  })
})

app.transaction('/upgrade', async (c) => {
  // const { frameData, inputText } = c;
  // const castId = frameData?.castId;
  // console.log('Roast transaction', castId);
  const data = await readRoastData(1);
  const upgradeAmount = 2 * (data.flowrate * (30*24*3600) / 10**18);
  
  return c.contract({
    abi: iseth_abi,
    chainId: 'eip155:84532',
    functionName: 'upgradeByETH',
    args: [],
    to: "0x143ea239159155B408e71CDbE836e8CFD6766732",
    value: parseEther(upgradeAmount.toString())
  })
})

app.transaction('/roast', async (c) => {
  const { frameData, inputText } = c;
  console.log("Input Text:", inputText);

  const data = await readRoastData(1);
  const newFlowRate = data.flowrate + 76649500;

  const fid = frameData?.fid;
  console.log('Roast transaction', fid);
  const roaster = await getUsernameFromFID(fid || 1);
  
  if (roaster) {
    await writeRoastData(1, roaster, inputText ?? '', newFlowRate);
  } else {
    console.error("Roaster username is null");
  }
  
  return c.contract({
    abi: cfa_abi,
    chainId: 'eip155:84532',
    functionName: 'setFlowrate',
    args: [superTokenAddress, botAddress, newFlowRate],
    to: contractAddress,
    // value: parseEther(inputText)
  })
})

app.frame('/finish', async (c) => {
  const { transactionId } = c
  const { frameData, inputText } = c;
  console.log('Finish frame', transactionId, frameData, inputText);

  const data = await readRoastData(1);
  
  return c.res({
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Congrats! You are now roasting {data.roastee}
      </div>
    ),
    intents: [
      <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

app.use('/*', serveStatic({ root: './public' }))
devtools(app, { serveStatic })

if (typeof Bun !== 'undefined') {
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  })
  console.log('Server is running on port 3000')
}
