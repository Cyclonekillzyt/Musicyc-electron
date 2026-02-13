import { google } from "googleapis";
const youtube = google.youtube({ version: "v3", key: process.env.YT });

export const searchYouTube = async (query) => {
  if (!query) {
    throw new Error("Query parameter is required");
  }

  const res = await youtube.search.list({
    key: process.env.YT,
    part: "snippet",
    q: `${query} song`,
    maxResults: 100,
    type: "video",
    videoCategoryId: "10",
  });
  return res.data.items
    .filter((item) => item.id.kind === "youtube#video")
    .map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      source: "stream",
      videoId: item.id.videoId,
      channel: item.snippet.channelTitle,
      thumbnails: item.snippet.thumbnails,
    }));
};
