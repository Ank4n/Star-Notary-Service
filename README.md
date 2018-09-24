# Star Notary Service

Register your favorite star in night sky to claim ownership of it. Now the world knows, you found it first.

### Prerequisites/Dependencies

- Node
- npm
- levelDB
- ExpressJS


### Configuring your project

- Initialise project dependencies
```
npm i
```

## Running the Star Notary service locally

1: Run node server locally on port 8000
```
node server.js
``` 

## APIS

### Request Validation
Request to register your favourite star with your blockchain address. You will need to prove your ownership to this address by signing it with your private key. 
```
POST /requestValidation
```  

Example Request

```
curl -X "POST" "http://localhost:8000/requestValidation" \
         -H 'Content-Type: application/json; charset=utf-8' \
         -d $'{
      "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd"
    }'
```

Example Response

``` 
{
    "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
    "requestTimeStamp": 1537810161995,
    "message": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd:1537810161995:starRegistry",
    "validationWindow": 300
}
```

### Validate Signature
Prove the address provided by you is really yours. We take trust seriously! 
```
POST /message-signature/validate
```  

Example Request

```
curl -X "POST" "http://localhost:8000/message-signature/validate" \
         -H 'Content-Type: application/json; charset=utf-8' \
         -d $'{
      "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
      "signature": "HyTWAj3ZEf5Nx0cJeuZvHkMbdSszZ4iy8uJspg03f7UMCJJW8pqawiZYCIp5sVE8Ku+ejrbeyG/saGusCmqb4qw="
    }'
```

Example Response

``` 
{
    "registerStar": true,
    "status": {
        "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
        "requestTimeStamp": 1537811096852,
        "message": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd:1537811096852:starRegistry",
        "validationWindow": 275,
        "messageSignature": "Valid"
    }
}
```

### Register Star
Once you verify your signature, you get access to register one star. 
```
POST /block
```  

Example Request

```
curl -X "POST" "http://localhost:8000/block" \
         -H 'Content-Type: application/json; charset=utf-8' \
         -d $'{
      "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
      "star": {
        "dec": "-26° 29'\'' 24.9",
        "ra": "16h 29m 1.0s",
        "story": "Found star using https://www.google.com/sky/"
      }
    }'
```

Example Response

``` 
{
    "hash": "d85be53accb825205880d33a8dd1d19437d8482892385ce7ec6a646226308bf6",
    "height": 7,
    "body": {
        "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1537811260",
    "previousBlockHash": "8f57d931ccc836209bdaa341156bad675dc63a39e2ce7f600485dfa20cdb9556"
}
```

### Get Stars by address
Get all your registered stars by your blockchain address
```
GET /stars/address:[ADDRESS]
```  

Example Request

```
curl "http://localhost:8000/stars/address:175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd"
```

Example Response

``` 
[
    {
        "hash": "8cba3464a5bfa9230cd1daf445fa39ba7f9fbd36e3df0e0ca74282c59f702cf3",
        "height": 1,
        "body": {
            "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
            "star": {
                "dec": "-26° 29' 24.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1537729194",
        "previousBlockHash": "028a38089b871f8742f635bf93f926eff59e20a6f897cb38a81f96d60f985e00"
    },
    {
        "hash": "51135c4c904c77aa87f5cffea7613bc10bc68affe87eacc62f41692d32cd5f65",
        "height": 2,
        "body": {
            "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
            "star": {
                "dec": "-26° 29' 24.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1537729200",
        "previousBlockHash": "8cba3464a5bfa9230cd1daf445fa39ba7f9fbd36e3df0e0ca74282c59f702cf3"
    }
]
```

### Get Star by Hash
Get your registered star with its block hash 
```
GET /stars/hash:[HASH]
```  

Example Request

```
curl "http://localhost:8000/stars/hash:8cba3464a5bfa9230cd1daf445fa39ba7f9fbd36e3df0e0ca74282c59f702cf3"
```

Example Response

``` 
{
    "hash": "4027db219ba33aa47e866f0f7d53930f99f648d2f4048996a2ea24094f2ee55b",
    "height": 4,
    "body": {
        "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1537809222",
    "previousBlockHash": "aa0f6df8c08aa42ea20600edc587966bf03894cc20d0fb1c107f852e5c644fe4"
}
```

### Get Star by Block Height
Get your registered star with its block Height 
```
GET /block/[HEIGHT]
```  

Example Request

```
curl "http://localhost:8000/block/4"
```

Example Response

``` 
{
    "hash": "4027db219ba33aa47e866f0f7d53930f99f648d2f4048996a2ea24094f2ee55b",
    "height": 4,
    "body": {
        "address": "175NEQUMfgwPiaj8hwYXmwvTwGKb43ohSd",
        "star": {
            "dec": "-26° 29' 24.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1537809222",
    "previousBlockHash": "aa0f6df8c08aa42ea20600edc587966bf03894cc20d0fb1c107f852e5c644fe4"
}
```
 
