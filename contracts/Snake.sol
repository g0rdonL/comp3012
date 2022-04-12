// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "base64-sol/base64.sol";

contract Snake is ERC721URIStorage, VRFConsumerBase {
    bytes32 public keyHash;
    uint256 public fee;
    uint256 public tokenCounter;

    // SVG parameters
    uint256 public maxNumberOfPaths;
    uint256 public maxNumberOfPathCommands;

    mapping(bytes32 => address) public requestIdToSender;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;

    event requestedSnake(bytes32 indexed requestId, uint256 indexed tokenId);
    event CreatedUnfinishedSnake(
        uint256 indexed tokenId,
        uint256 indexed randomNumber
    );

    event CreatedSnake(uint256 indexed tokenId, string tokenURI);

    constructor(
        address _VRFCoordinator,
        address _LinkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(_VRFCoordinator, _LinkToken) ERC721("Snake", "SNA") {
        fee = _fee;
        keyHash = _keyHash;
        tokenCounter = 0;
    }

    function create() public returns (bytes32 requestId) {
        requestId = requestRandomness(keyHash, fee);
        requestIdToSender[requestId] = msg.sender;
        uint256 tokenId = tokenCounter;
        requestIdToTokenId[requestId] = tokenId;
        tokenCounter = tokenCounter + 1;
        emit requestedSnake(requestId, tokenId);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomNumber)
        internal
        override
    {
        // The Chainlink VRT has a max gas of 200,000 gas (computation units)
        // 2M gas
        address nftOwner = requestIdToSender[requestId];
        uint256 tokenId = requestIdToTokenId[requestId];
        _safeMint(nftOwner, tokenId);
        // generateSnake
        tokenIdToRandomNumber[tokenId] = randomNumber;
        emit CreatedUnfinishedSnake(tokenId, randomNumber);
    }

    function finishMint(uint256 tokenId) public {
        // check to see if its been minted and a random number is returned
        require(
            bytes(tokenURI(tokenId)).length <= 0,
            "tokenURI is already all set!"
        );
        require(tokenCounter > tokenId, "TokenId has not been minted yet!");
        require(
            tokenIdToRandomNumber[tokenId] > 0,
            "Need to wait for Chainlink VRF"
        );
        // generate some random SVG code
        uint256 randomNumber = tokenIdToRandomNumber[tokenId];
        string memory randomColor = generateRandomColor(randomNumber);
        string memory svg = generateSVG(randomColor);
        string memory imageURI = svgToImageURI(svg);
        string memory tokenURI = formatTokenURI(imageURI, randomColor);
        _setTokenURI(tokenId, tokenURI);
        emit CreatedSnake(tokenId, svg);

        // turn that into an Image URI
        // use that imageURI to format into a token URI
    }

    function formatTokenURI(string memory imageURI, string memory randomColor)
        public
        pure
        returns (string memory)
    {
        string memory baseURL = "data:application/json;base64,";
        return
            string(
                abi.encodePacked(
                    baseURL,
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name": "Snake", ',
                                '"description": "An NFT based on SVG", ',
                                '"attributes": [{"trait_type": "Color", "value": "',
                                randomColor,
                                '"}],',
                                '"image": "',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function svgToImageURI(string memory svg)
        public
        pure
        returns (string memory)
    {
        // data:image/svg+xml;base64,<Base64-encoding>
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );

        string memory imageURI = string(
            abi.encodePacked(baseURL, svgBase64Encoded)
        );
        return imageURI;
    }

    function getChar(uint256 begin, string memory str)
        public
        pure
        returns (string memory)
    {
        uint256 end = begin + 1;
        bytes memory a = new bytes(end - begin + 1);
        for (uint256 i = 0; i <= end - begin; i++) {
            a[i] = bytes(str)[i + begin - 1];
        }
        return string(a);
    }

    function generateRandomColor(uint256 randomNumber)
        public
        pure
        returns (string memory)
    {
        string memory str = "0123456789abcdef";
        string memory randomColor = "#";

        for (uint256 i = 0; i < 3; i++) {
            randomColor = string(
                abi.encodePacked(
                    randomColor,
                    getChar(
                        uint256(keccak256(abi.encode(randomNumber, i + 1))) %
                            16,
                        str
                    )
                )
            );
        }
        return randomColor;
    }

    function generateSVG(string memory randomColor)
        public
        pure
        returns (string memory finalSVG)
    {
        finalSVG = string(
            abi.encodePacked(
                "<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='500px' height='500px'>",
                "<path style=' stroke:none;fill-rule:nonzero;fill:",
                randomColor,
                ";fill-opacity:1;' d='M 465.113281 471.359375 C 462.308594 461.222656 458.089844 449.539062 457.144531 443.738281 C 452.523438 415.460938 398.214844 385.632812 295.054688 362.335938 C 260.453125 354.523438 219.808594 344.3125 204.738281 339.644531 C 116.046875 312.191406 85.804688 252.828125 125 183.125 C 134.820312 165.65625 142.855469 147.511719 142.855469 142.796875 C 142.855469 128.316406 104.800781 95.972656 88.019531 95.503906 C 60.542969 94.742188 28.570312 59.140625 28.570312 43.664062 C 28.570312 32.074219 61.730469 33.136719 86.585938 37.71875 C 86.585938 37.71875 119.339844 41.296875 130.042969 66.167969 C 133.40625 73.980469 131.515625 77.664062 138.328125 85.789062 C 145.140625 93.910156 166.867188 107.238281 172.597656 114.59375 C 191.535156 138.914062 190.28125 159.394531 171.585938 191.800781 C 163.816406 205.273438 157.386719 224.421875 157.300781 234.355469 C 157.085938 258.90625 192.542969 289.71875 238.742188 305.128906 C 258.683594 311.78125 309.476562 330.628906 351.617188 347.011719 C 443.828125 382.867188 463.929688 400.082031 472.738281 450.75 C 479.527344 489.796875 476.6875 497.472656 465.113281 471.359375 Z M 465.113281 471.359375 '/>",
                "<path style='fill:none;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke:",
                randomColor,
                ";stroke-opacity:1;stroke-miterlimit:4;' d='M 5.071172 7.446797 L 2.687344 5.472109 L 2.380547 4.187867 M 2.827891 5.424828 L 1.365547 5.017375 ' transform='matrix(7.142857,0,0,5.617978,0,0)'/>",
                "</svg>"
            )
        );
    }
}
