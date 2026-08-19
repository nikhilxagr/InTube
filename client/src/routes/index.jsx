import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.jsx';
import { ROUTES } from '../constants/routes.js';

// Pages
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
      { path: ROUTES.HOW_IT_WORKS, element: <HowItWorks /> },
      { path: ROUTES.FAQ, element: <FAQ /> },
      { path: ROUTES.ABOUT, element: <About /> },
      { path: ROUTES.PRIVACY, element: <Privacy /> },
      { path: ROUTES.TERMS, element: <Terms /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
