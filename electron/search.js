import { google } from "googleapis";
const youtube = google.youtube({ version: "v3", key: process.env.YT });


export const searchYouTube = async (query) => {

  
  if (!query) {
    throw new Error("Query parameter is required");
  }

  const res = await youtube.search.list({
    key: process.env.YT,
    part: "snippet",
    q: query,
    maxResults: 15,
    type: "video",
    videoCategoryId: "10",
  });
  return res.data.items.map((item) => ({
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    videoId: item.id.videoId,
    thumbnails: item.snippet.thumbnails,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
};
