/**
 * A. AdminDashboard Page (`/admin/dashboard`)
 *
 * Displays:
 * - Total projects & featured count
 * - Total interests/hobbies
 * - Total technologies in stack carousel
 * - Total & unread contact messages
 * - Quick actions & content overview
 * - Recent content updates feed
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeAllProjectsAdmin } from '../../services/projectService';
import { subscribeAllInterestsAdmin } from '../../services/interestService';
import { subscribeTools } from '../../services/contentService';
import { subscribeMessagesAdmin } from '../../services/messageService';
import { formatDateTime } from '../../utils/formatters';
import styles from './AdminPages.module.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [interests, setInterests] = useState([]);
  const [tools, setTools] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubProj = subscribeAllProjectsAdmin(setProjects);
    const unsubInt = subscribeAllInterestsAdmin(setInterests);
    const unsubTools = subscribeTools(setTools);
    const unsubMsg = subscribeMessagesAdmin(setMessages);

    return () => {
      unsubProj();
      unsubInt();
      unsubTools();
      unsubMsg();
    };
  }, []);

  const featuredCount = useMemo(
    () => projects.filter((p) => p.featured).length,
    [projects]
  );

  const unreadMessagesCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages]
  );

  // Combine recent items across projects, interests, and messages
  const recentUpdates = useMemo(() => {
    const combined = [
      ...projects.map((p) => ({
        id: `proj-${p.id}`,
        title: p.title,
        type: 'PROJECT',
        timestamp: p.updatedAt || p.createdAt,
        link: '/admin/projects',
      })),
      ...interests.map((i) => ({
        id: `int-${i.id}`,
        title: i.title,
        type: 'INTEREST / HOBBY',
        timestamp: i.updatedAt || i.createdAt,
        link: '/admin/interests',
      })),
      ...messages.map((m) => ({
        id: `msg-${m.id}`,
        title: `Inquiry from ${m.senderName}`,
        type: m.read ? 'MESSAGE (READ)' : 'NEW MESSAGE',
        timestamp: m.createdAt,
        link: '/admin/messages',
      })),
    ];

    return combined
      .sort((a, b) => {
        const secA = a.timestamp?.seconds || 0;
        const secB = b.timestamp?.seconds || 0;
        return secB - secA;
      })
      .slice(0, 7);
  }, [projects, interests, messages]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.headerMeta}>
          <span className={styles.pageCode}>ADMIN // 01 OVERVIEW</span>
          <h1 className={styles.pageTitle}>SYSTEM DASHBOARD</h1>
          <p className={styles.pageSubtitle}>
            Manage your portfolio projects, personal interests, static page copy,
            technology carousel, and incoming visitor messages in real time.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className={styles.primaryBtn}
          >
            + MANAGE PROJECTS
          </button>
        </div>
      </header>

      {/* Top Metrics Strip */}
      <section className={styles.statsGrid} aria-label="Portfolio statistics">
        <div className={styles.statCard}>
          <span className={styles.statLabel}>01 // TOTAL PROJECTS</span>
          <span className={styles.statNumber}>
            {String(projects.length).padStart(2, '0')}
          </span>
          <span className={styles.statMeta}>
            {featuredCount} Featured • {projects.filter((p) => p.published !== false).length} Published
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>02 // INTERESTS & HOBBIES</span>
          <span className={styles.statNumber}>
            {String(interests.length).padStart(2, '0')}
          </span>
          <span className={styles.statMeta}>
            {interests.filter((i) => i.published !== false).length} Active Entries
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>03 // STACK TECHNOLOGIES</span>
          <span className={styles.statNumber}>
            {String(tools.length).padStart(2, '0')}
          </span>
          <span className={styles.statMeta}>Infinite Carousel Items</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>04 // INBOX MESSAGES</span>
          <span className={styles.statNumber}>
            {String(messages.length).padStart(2, '0')}
          </span>
          <span className={styles.statMeta}>
            {unreadMessagesCount} Unread Inquiries
          </span>
        </div>
      </section>

      {/* Quick Actions & Recent Activity */}
      <div className={styles.dashboardCols}>
        <section className={styles.panelBox}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>QUICK ACTIONS // NAVIGATION</h2>
          </div>

          <div className={styles.quickActionsGrid}>
            <button
              type="button"
              onClick={() => navigate('/admin/projects')}
              className={styles.quickActionCard}
            >
              <span className={styles.quickActionCode}>MODULE 02</span>
              <span className={styles.quickActionLabel}>Add or Reorder Projects →</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/interests')}
              className={styles.quickActionCard}
            >
              <span className={styles.quickActionCode}>MODULE 03</span>
              <span className={styles.quickActionLabel}>Manage Interests & Hobbies →</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/content')}
              className={styles.quickActionCard}
            >
              <span className={styles.quickActionCode}>MODULE 04</span>
              <span className={styles.quickActionLabel}>Edit Hero, About & Process →</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/messages')}
              className={styles.quickActionCard}
            >
              <span className={styles.quickActionCode}>MODULE 05</span>
              <span className={styles.quickActionLabel}>
                Open Messages Inbox ({unreadMessagesCount} New) →
              </span>
            </button>
          </div>
        </section>

        <section className={styles.panelBox}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>RECENT CONTENT UPDATES</h2>
          </div>

          {recentUpdates.length === 0 ? (
            <p className={styles.pageSubtitle}>
              No recent activity recorded yet. Add your first project or update your content.
            </p>
          ) : (
            <div className={styles.recentList}>
              {recentUpdates.map((item) => (
                <div key={item.id} className={styles.recentRow}>
                  <div className={styles.recentInfo}>
                    <span className={styles.recentType}>{item.type}</span>
                    <button
                      type="button"
                      onClick={() => navigate(item.link)}
                      className={styles.recentTitle}
                      style={{ textAlign: 'left' }}
                    >
                      {item.title}
                    </button>
                  </div>
                  <span className={styles.recentDate}>
                    {formatDateTime(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

