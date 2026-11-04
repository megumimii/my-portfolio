/**
 * Public Portfolio Page (`<PortfolioPage />`)
 *
 * Single-page scrolling experience orchestrating:
 * - High-tech Minimalist Entrance Gate Preloader (`<EntranceGate />`)
 * - Sticky white Navbar (`<Navbar />`)
 * - A. Hero Section (`<HeroSection />`)
 * - B. About Me (`<AboutSection />`)
 * - C. My Thought Process 80:20 (`<ThoughtProcessSection />`)
 * - D. My Tools & Technologies Carousel (`<ToolsMarquee />`)
 * - E. My Projects (`<ProjectsSection />`)
 * - F. Interests & Hobbies (`<InterestsSection />`)
 * - G. Let's Talk (`<ContactSection />`)
 */
import { useMemo, useState } from 'react';
import EntranceGate from '../components/common/EntranceGate';
import Navbar from '../components/common/Navbar';
import HeroSection from '../components/portfolio/HeroSection';
import AboutSection from '../components/portfolio/AboutSection';
import ThoughtProcessSection from '../components/portfolio/ThoughtProcessSection';
import ToolsMarquee from '../components/portfolio/ToolsMarquee';
import ProjectsSection from '../components/portfolio/ProjectsSection';
import InterestsSection from '../components/portfolio/InterestsSection';
import ContactSection from '../components/portfolio/ContactSection';
import { usePortfolioData } from '../hooks/usePortfolioData';

export default function PortfolioPage() {
  const { siteContent, tools, projects, interests, loading } = usePortfolioData();
  const [heroReadyToEnter, setHeroReadyToEnter] = useState(false);

  const brandName = siteContent?.hero?.fullName
    ? `${siteContent.hero.fullName.toUpperCase()} // DEV`
    : 'JOHN CHRISTIAN ISAAC // DEV';

  const portraitUrl = siteContent?.hero?.portraitUrl;

  // Collect primary visual assets to preload before the Entrance Gate opens
  const criticalImageUrls = useMemo(() => {
    const urls = [];
    if (portraitUrl) {
      urls.push(portraitUrl);
    }

    if (Array.isArray(projects)) {
      projects.slice(0, 2).forEach((p) => {
        if (p?.coverImageUrl) urls.push(p.coverImageUrl);
      });
    }
    return urls;
  }, [portraitUrl, projects]);

  return (
    <div>
      <EntranceGate
        dataLoading={loading}
        imageUrls={criticalImageUrls}
        onGateOpening={() => setHeroReadyToEnter(true)}
      />
      <Navbar brandName={brandName} />
      <main>
        <HeroSection
          data={siteContent?.hero}
          readyToEnter={heroReadyToEnter}
        />
        <AboutSection data={siteContent?.about} />
        <ThoughtProcessSection data={siteContent?.thoughtProcess} />
        <ToolsMarquee tools={tools} />
        <ProjectsSection projects={projects} />
        <InterestsSection interests={interests} />
      </main>
      <ContactSection data={siteContent?.contact} />
    </div>
  );
}
