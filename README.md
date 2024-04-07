# JS Discord Bot
A discord bot made by me just for fun

It plays music (just YouTube for now), sends lyrics, videos and you can subscribe to mangas from MangaDex to be notified when a chapter is released

## Commands (prefix: &)
#### Basic commands:
* help: lists existing commands
* avatar [@mention]: sends the avatar
#### Mangas:
* manga [sub/unsub]: lists the mangas that you can subscribe (bot will notify each 12 hours if any manga releases a new chapter on MangaDex)
* manga subs: shows the mangas that you have subscription
* manga list: shows the mangas that are available to subscribe
#### Musics:
* lyrics: searches for the song you requested and sends the lyrics in chat
* play: searches and play the song
* skip: skips the current song
* pause: pauses the current song
* resume: resume the current song
* remove: remove a position from the queue
* forward: forwards the track
* backward: backwards the track
* loop: loops the current song
* loopqueue: loops the queue
* shuffle: shuffles the current song
* queue: shows the current song queue
* clear: clear the current queue
* quit: disconnects the bot from the voice call
#### Videos:
* video: searches for the video you requested on YouTube, downloads it and sends in chat
#### Other:
* riso [@mention]: laughs at someone
* kys [@mention]: keep yourself safe
* pp: pp size
* poggers: poggers

## How it works
### Mangas
To make the subscription and notify system it was used a json to keep the mangas that I wanted to be available, in it would be stored the id from the mangas and their subscribers.
The folder [data](https://github.com/cgmuniz/bot-discordjs/tree/main/data) has a `dummyData.json` as an example for what will be used, you can change the name from the file to `mangas.json` 
or change the path in [mangasSubs.js](https://github.com/cgmuniz/bot-discordjs/blob/main/utils/mangasSubs.js).
For the verification of new chapters it was used the [MangaDex API](https://api.mangadex.org/docs/), checking if any chapter was released in the past 12 hours (code will run each 12 hours).
### Musics
To get the song from links it was used [ytdl-core](https://www.npmjs.com/package/ytdl-core), for search arguments [yt-search](https://www.npmjs.com/package/yt-search) and for playlists [ytpl](https://www.npmjs.com/package/ytpl).
To join the voice channel and actually play the music it was used [discord-player](https://www.npmjs.com/package/discord-player) and [@discordjs/voice](https://www.npmjs.com/package/@discordjs/voice).
### Videos
Same process of the songs, used [ytdl-core](https://www.npmjs.com/package/ytdl-core) to links and [yt-search](https://www.npmjs.com/package/yt-search) to searches.
Just changed the code to work for videos, it downloads the video as video.mp4 and after sending it in the chat, the video is deleted to not occupies the memory.

## How to use
1. In the project directory, run `npm install` to install the dependencies
2. Create a .env file with: `TOKEN=yourtoken`
3. Change the `/data/dummyData.json` file name to `mangasSubs.json`
4. Run in the terminal with `node .`
