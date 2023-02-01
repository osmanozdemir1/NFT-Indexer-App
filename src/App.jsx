import {
  Alert,
  AlertIcon,
  AlertDescription,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Tag,
  Stack
} from '@chakra-ui/react';
import { Alchemy, Network } from 'alchemy-sdk';
import { useState } from 'react';
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const config = {
  apiKey: 'TYPE YOUR API KEY HERE',
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

function App() {
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState();
  const [account, setAccount] = useState();

  async function connectWallet() {
    if(!window.ethereum){
      alert("MetaMask is not installed!")
    } 

    const accounts = await provider.send('eth_requestAccounts', []);
    setAccount(accounts[0]);
  }

  async function getNFTsForOwner(address) {
    const data = await alchemy.nft.getNftsForOwner(address);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.ownedNfts.length; i++) {
      const tokenData = alchemy.nft.getNftMetadata(
        data.ownedNfts[i].contract.address,
        data.ownedNfts[i].tokenId
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  }

  console.log("results: ", results);

  async function getWalletNFTs(){
    if(!account){
      alert("Please Connect Wallet")
    }
    await getNFTsForOwner(account);
  }

  async function getQueryNFTs(){
    const addr = document.getElementById('inputAddress').value;
    const isAddress = ethers.utils.isAddress(addr);
    const isENS = await alchemy.core.resolveName(addr);
    if (!isAddress && isENS == null){
      alert("Please type a valid address!");
    } else {
      await getNFTsForOwner(addr);
    }
  }


  return (
    <Box w="100vw">
      <Stack align="end" m={5}>
        {!account ? (
        <Button variant="outline" onClick={connectWallet} size="sm" colorScheme="teal">
          Connect Wallet
        </Button>) : (
        <Tag size="sm" colorScheme="teal">
          Connected
        </Tag>
        )}
      </Stack>
      <Center mb={10}>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={2} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>
            Plug in an address and this website will return all of its NFTs!
          </Text>
          <Button fontSize={20} onClick={getWalletNFTs} mt={3} colorScheme="teal">
            Click to see your own NFTs!
          </Button>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={45} fontSize={24}>Get all the ERC-721 tokens of this address:</Heading>
        <Input
          id="inputAddress"
          color="black"
          w="500px"
          textAlign="center"
          placeholder='Please Type a Wallet Address'
          _placeholder={{opacity: 0.4, color:'grey', fontSize:'20'}}
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getQueryNFTs} mt={3} colorScheme="telegram">
          Fetch NFTs for input address
        </Button>

        <Heading mt={12} mb={2} fontSize={24}>Here are your NFTs:</Heading>

        {hasQueried ? (
          <div>
            {
              !tokenDataObjects ? (
                <Alert status='info'>
                  <AlertIcon />
                  <AlertDescription>
                    NFTs are loading...
                  </AlertDescription>
                </Alert>
              ) : (
                <div>
                { tokenDataObjects.length == 0 ? (
                    <Alert status='warning'>
                      <AlertIcon />
                      <AlertDescription>
                        You don't own any NFTs!
                      </AlertDescription>
                    </Alert>
                ) : (
                    <SimpleGrid w={'90vw'} columns={4} spacing={24}>
                    {results.ownedNfts.map((e, i) => {
                      return (
                        <Flex
                          flexDir={'column'}
                          color="black"
                          w={'20vw'}
                          key={e.id}
                        >
                          <Box>
                            <b>Name:</b> {tokenDataObjects[i].title}&nbsp;
                          </Box>
                          <Image src={tokenDataObjects[i].rawMetadata.image} />
                        </Flex>
                      );
                    })}
                    </SimpleGrid>
                  )
                }
                </div>
              )
            }
          </div>
        ) : (
          'Please make a query! The query may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;
