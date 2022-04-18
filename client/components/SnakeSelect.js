import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { nftContractAddress } from '../config.js'

export const SnakeSelect = ({ color, setColor, snakes, currentAccount }) => {
  return (
    <Box sx={{ mt: "1rem" }}>
      <FormControl fullWidth>
        {snakes.length > 0 ?
          <>
            <InputLabel id="snake-select-label">Select Snake</InputLabel>
            <Select
              labelId="snake-select-label"
              value={color}
              label="Select Snake"
              onChange={e => setColor(e.target.value)}
            >
              {snakes && snakes.map(snake => {
                if (snake.meta && snake.meta.attributes[0] && snake.tokenId) {
                  return <MenuItem value={snake.meta.attributes[0].value}>
                    <div>
                      <img
                        src={snake.meta.image.url.ORIGINAL}
                        height="15px"
                        width="15px"
                      />
                      {" "}Snake {snake.tokenId}
                    </div>
                  </MenuItem>
                }
              })}
            </Select>
          </>
          :
          <>
            <InputLabel id="snake-select-label">Get yourself a snake in &quot;Mint&quot; tab</InputLabel>
            <Select
              labelId="snake-select-label"
              value={color}
              label="Select Snake"
            >
              <MenuItem value="">
                <a target="_blank" rel="noreferrer" href={`https://rinkeby.rarible.com/user/${currentAccount}/owned?filter%5Bcollections%5D%5B%5D=${nftContractAddress}`}>
                  If you do have a snake, referesh its metadata
                </a>
              </MenuItem>
            </Select>
          </>
        }
      </FormControl>
    </Box>
  );
}
