## to run the app

from the client/ folder run `npm start`

from the server/ folder run `npm start`

if you want to connect the front end to the local server, make sure in Game.js you set the `ENDPOINT` variable to `localhost:5000` instead of the heroku url

## to deploy

first run `npm run build`

then make sure to copy the `_redirects` file over from client/ to client/build/

then run `netlify deploy` and when it asks which folder, enter `./build`

then run `netlify deploy --prod` and when it asks which folder, enter `./build`