import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.jsx';
import { ROUTES } from '../constants/routes.js';

// General Pages
import { Home } from '../pages/Home.jsx';
import { Instagram } from '../pages/Instagram.jsx';
import { Reels } from '../pages/Reels.jsx';
import { Stories } from '../pages/Stories.jsx';
import { Posts } from '../pages/Posts.jsx';
import { Facebook } from '../pages/Facebook.jsx';
import { YouTube } from '../pages/YouTube.jsx';
import { YouTubeVideo } from '../pages/YouTubeVideo.jsx';
import { YouTubeShorts } from '../pages/YouTubeShorts.jsx';
import { YouTubeMP3 } from '../pages/YouTubeMP3.jsx';
import { Tools } from '../pages/Tools.jsx';
import { HowItWorks } from '../pages/HowItWorks.jsx';
import { FAQ } from '../pages/FAQ.jsx';
import { About } from '../pages/About.jsx';
import { Privacy } from '../pages/Privacy.jsx';
import { Terms } from '../pages/Terms.jsx';

// Media Tools Pages
import { BatchDownloader } from '../pages/tools/BatchDownloader.jsx';
import { VideoToAudio } from '../pages/tools/VideoToAudio.jsx';
import { VideoConverter } from '../pages/tools/VideoConverter.jsx';
import { VideoToImage } from '../pages/tools/VideoToImage.jsx';
import { AudioConverter } from '../pages/tools/AudioConverter.jsx';
import { ImageTools } from '../pages/tools/ImageTools.jsx';
import { ImageConverter } from '../pages/tools/ImageConverter.jsx';
import { ImageCompressor } from '../pages/tools/ImageCompressor.jsx';
import { ImageResizer } from '../pages/tools/ImageResizer.jsx';
import { ThumbnailDownloader } from '../pages/tools/ThumbnailDownloader.jsx';
import { MetadataTool } from '../pages/tools/MetadataTool.jsx';
import { QrTransferPage } from '../pages/tools/QrTransferPage.jsx';

// Standalone Mobile Transfer Page
import { TransferPage } from '../pages/TransferPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: ROUTES.INSTAGRAM, element: <Instagram /> },
      { path: ROUTES.INSTAGRAM_REELS, element: <Reels /> },
      { path: ROUTES.INSTAGRAM_STORIES, element: <Stories /> },
      { path: ROUTES.INSTAGRAM_POSTS, element: <Posts /> },
      { path: ROUTES.FACEBOOK, element: <Facebook /> },
      { path: ROUTES.YOUTUBE, element: <YouTube /> },
      { path: ROUTES.YOUTUBE_VIDEO, element: <YouTubeVideo /> },
      { path: ROUTES.YOUTUBE_SHORTS, element: <YouTubeShorts /> },
      { path: ROUTES.YOUTUBE_MP3, element: <YouTubeMP3 /> },
      { path: ROUTES.TOOLS, element: <Tools /> },
      { path: ROUTES.TOOLS_BATCH, element: <BatchDownloader /> },
      { path: ROUTES.TOOLS_VIDEO_TO_AUDIO, element: <VideoToAudio /> },
      { path: ROUTES.TOOLS_VIDEO_TO_IMAGE, element: <VideoToImage /> },
      { path: ROUTES.TOOLS_CONVERTER, element: <VideoConverter /> },
      { path: ROUTES.TOOLS_AUDIO_CONVERTER, element: <AudioConverter /> },
      { path: ROUTES.TOOLS_IMAGE, element: <ImageTools /> },
      { path: ROUTES.TOOLS_IMAGE_CONVERT, element: <ImageConverter /> },
      { path: ROUTES.TOOLS_IMAGE_COMPRESS, element: <ImageCompressor /> },
      { path: ROUTES.TOOLS_IMAGE_RESIZE, element: <ImageResizer /> },
      { path: ROUTES.TOOLS_THUMBNAIL, element: <ThumbnailDownloader /> },
      { path: ROUTES.TOOLS_METADATA, element: <MetadataTool /> },
      { path: ROUTES.TOOLS_QR_TRANSFER, element: <QrTransferPage /> },
      { path: ROUTES.HOW_IT_WORKS, element: <HowItWorks /> },
      { path: ROUTES.FAQ, element: <FAQ /> },
      { path: ROUTES.ABOUT, element: <About /> },
      { path: ROUTES.PRIVACY, element: <Privacy /> },
      { path: ROUTES.TERMS, element: <Terms /> }
    ]
  },
  // Mobile QR direct transfer page (standalone lightweight layout)
  {
    path: ROUTES.TRANSFER,
    element: <TransferPage />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
