import { serveStatic } from '@hono/node-server/serve-static'
import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child } from "firebase/database";
// import ABI from "./abi.json";
import { cfa_abi, iseth_abi } from './abi'

// import { neynar } from 'frog/hubs'

const contractAddress = "0xcfA132E353cB4E398080B9700609bb008eceB125";
const botAddress = "0x23B125467AE38C20dAE8A2B52D3019a06A48105c";
const superTokenAddress = "0x143ea239159155b408e71cdbe836e8cfd6766732";
// const flowRate = 327245050000000000;
const flowRate = 766495000;

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

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  title: 'Super Roast',
})

app.use('/*', serveStatic({ root: './public' }))

app.frame('/', async (c) => {
  const { buttonValue, inputText, status } = c;
  const data = await readRoastData(1);
  console.log(data.roaster, data.roastee, data.flowrate);
  return c.res({
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
            {status === "response" ?
            `Congrats! You are now roasting  ${data.roastee}` 
            : `${data.roaster} is roasting ${data.roastee} for ${(data.flowrate*(30*24*3600)/10**18).toFixed(3)} ETH per month. Pay more to roast someone else.` }
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Type Farcaster username to roast" />,
      <Button.Transaction target="/roast">Roast</Button.Transaction>,
      status === 'response' && <Button.Reset>Reset</Button.Reset>,
    ],
  })
})

app.transaction('/roast', async (c) => {
  const { frameData, inputText } = c;
  const castId = frameData?.castId;
  console.log('Roast transaction', castId);
  const data = await readRoastData(1);
  const newFlowRate = data.flowrate + 766495000;
  await writeRoastData(1, "Daniel", inputText ?? '', newFlowRate);
  
  // Contract transaction response.
  return c.contract({
    abi: cfa_abi,
    chainId: 'eip155:84532',
    functionName: 'setFlowrate',
    args: [superTokenAddress, botAddress, newFlowRate],
    to: contractAddress,
    // value: parseEther(inputText)
  })
})

devtools(app, { serveStatic })
