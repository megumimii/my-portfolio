/**
 * Public Portfolio Realtime Data Hook
 *
 * Orchestrates Firestore `onSnapshot` subscriptions for:
 * - `siteContent` (Hero, About, Thought Process, Contact)
 * - `tools` (Infinite technology carousel)
 * - `projects` (Published portfolio projects)
 * - `interests` (Published hobbies & personal interests)
 */
import { useEffect, useState } from 'react';
import {
  subscribeSiteContent,
  subscribeTools,
} from '../services/contentService';
import { subscribePublishedProjects } from '../services/projectService';
import { subscribePublishedInterests } from '../services/interestService';

const EMPTY_SITE_CONTENT = {
  hero: {},
  about: {},
  thoughtProcess: {},
  contact: {},
};

export function usePortfolioData() {
  const [siteContent, setSiteContent] = useState(EMPTY_SITE_CONTENT);
  const [tools, setTools] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let loadedCount = 0;
    const markLoaded = () => {
      loadedCount += 1;
      if (loadedCount >= 4) {
        setLoading(false);
      }
    };

    const unsubContent = subscribeSiteContent((data) => {
      setSiteContent(data);
      markLoaded();
    });

    const unsubTools = subscribeTools((items) => {
      setTools(items.filter((t) => t.active !== false));
      markLoaded();
    });

    const unsubProjects = subscribePublishedProjects((items) => {
      setProjects(items);
      markLoaded();
    });

    const unsubInterests = subscribePublishedInterests((items) => {
      setInterests(items);
      markLoaded();
    });

    return () => {
      unsubContent();
      unsubTools();
      unsubProjects();
      unsubInterests();
    };
  }, []);

  return {
    siteContent,
    tools,
    projects,
    interests,
    loading,
  };
}

