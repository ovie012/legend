import React, { useCallback, useContext, useDeferredValue, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUpRight, FiSearch, FiPlus, FiCode, FiCpu } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { HiSparkles } from 'react-icons/hi2';
import { AppContext } from '../AppProvider';
import ProjectOrbit from '../components/ProjectOrbit';
import ProjectModal from '../components/ProjectModal';

const PAGE_SIZE = 9;

const categoryLabels = {
  'Professional Projects': 'Professional',
  'Personal Projects': 'Personal',
  'Bootcamps / Internship Projects': 'Bootcamp',
  'Fun Projects': 'Fun',
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Merge every project list into one de-duplicated list, tagging each with its categories.
function useAllProjects(projectsData, favorites) {
  return useMemo(() => {
    const byLink = new Map();

    const add = (project, category, favorite = false) => {
      const existing = byLink.get(project.link);
      if (existing) {
        if (!existing.categories.includes(category)) existing.categories.push(category);
        existing.favorite ||= favorite;
        return;
      }
      byLink.set(project.link, { ...project, categories: [category], favorite });
    };

    favorites.forEach((p) => add(p, 'Favorite', true));
    projectsData.forEach((group) =>
      group.projects.forEach((p) => add(p, categoryLabels[group.projectType] ?? group.projectType))
    );

    return [...byLink.values()];
  }, [projectsData, favorites]);
}

// 3D tilt that follows the cursor; writes CSS vars directly so React never re-renders.
const handleTilt = (e) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
  el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
  el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
};

const resetTilt = (e) => {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
};

function Projects() {
  const { projectsData, projects: favorites, aiProjects } = useContext(AppContext);
  const allProjects = useAllProjects(projectsData, favorites);

  // AI Engineering is its own track; it only exists once `aiProjects` (AppProvider) has entries.
  const [params, setParams] = useSearchParams();
  const hasAI = aiProjects.length > 0;
  const track = hasAI && params.get('track') === 'ai' ? 'ai' : 'software';
  const aiList = useMemo(() => aiProjects.map((p) => ({ ...p, categories: ['AI'], favorite: false })), [aiProjects]);
  const list = track === 'ai' ? aiList : allProjects;

  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [active, setActive] = useState(null);
  const deferredQuery = useDeferredValue(query);

  const filters = useMemo(() => {
    const names = track === 'ai' ? ['All'] : ['All', 'Favorite', ...Object.values(categoryLabels)];
    return names.map((name) => ({
      name,
      count: name === 'All' ? list.length : list.filter((p) => p.categories.includes(name)).length,
    }));
  }, [list, track]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return list.filter((p) => {
      const inFilter = filter === 'All' || p.categories.includes(filter);
      const inQuery = !q || `${p.title} ${p.description} ${p.titleLong}`.toLowerCase().includes(q);
      return inFilter && inQuery;
    });
  }, [list, filter, deferredQuery]);

  const shown = filtered.slice(0, visible);

  const changeFilter = (name) => {
    setFilter(name);
    setVisible(PAGE_SIZE);
  };

  const closeModal = useCallback(() => setActive(null), []);

  const changeTrack = (next) => {
    setParams(next === 'ai' ? { track: 'ai' } : {}, { replace: true });
    setFilter('All');
    setQuery('');
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="pj-page">
      <div className="pj-glow" aria-hidden="true"></div>

      {/* HERO */}
      <section className="pj-hero">
        <motion.div className="pj-hero-text" initial="hidden" animate="visible">
          <motion.span className="pj-eyebrow" variants={fadeUp} custom={0}>
            <HiSparkles /> Portfolio
          </motion.span>
          {track === 'ai' ? (
            <>
              <motion.h1 variants={fadeUp} custom={1}>
                AI engineering & <span className="pj-accent">intelligent builds</span>.
              </motion.h1>
              <motion.p variants={fadeUp} custom={2}>
                Language pipelines, retrieval-powered assistants and AI-driven products, built end to end from model
                to polished interface.
              </motion.p>
            </>
          ) : (
            <>
              <motion.h1 variants={fadeUp} custom={1}>
                Selected work & <span className="pj-accent">creative builds</span>.
              </motion.h1>
              <motion.p variants={fadeUp} custom={2}>
                From client platforms to playful experiments, a collection of projects that sharpened my craft and
                deepened my understanding of modern web and mobile development.
              </motion.p>
            </>
          )}
          <motion.div className="pj-hero-stats" variants={fadeUp} custom={3}>
            <div>
              <strong>{list.length}</strong>
              <span>{track === 'ai' ? 'AI projects' : 'Projects'}</span>
            </div>
            {track === 'software' && (
              <>
                <div>
                  <strong>2022</strong>
                  <span>Building since</span>
                </div>
                <div>
                  <strong>{favorites.length}</strong>
                  <span>Favorites</span>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="pj-hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProjectOrbit
            key={track}
            items={(track === 'ai' ? aiList : favorites).slice(0, 8)}
            onSelect={(item) => setActive(list.find((p) => p.link === item.link))}
          />
        </motion.div>
      </section>

      {/* TRACKS: Software / AI Engineering (only once AI projects exist) */}
      {hasAI && (
        <section className="pj-tracks" role="tablist" aria-label="Project track">
          {[
            { id: 'software', label: 'Software Engineering', icon: <FiCode />, count: allProjects.length },
            { id: 'ai', label: 'AI Engineering', icon: <FiCpu />, count: aiList.length },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={track === t.id}
              className={`pj-track ${track === t.id ? 'is-active' : ''}`}
              onClick={() => changeTrack(t.id)}
            >
              {track === t.id && <motion.span layoutId="pj-track-pill" className="pj-track-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="pj-track-label">{t.icon} {t.label} <em>{t.count}</em></span>
            </button>
          ))}
        </section>
      )}

      {/* TOOLBAR */}
      <section className="pj-toolbar">
        <div className="pj-filters" role="tablist" aria-label="Filter projects">
          {filters.map((f) => (
            <button
              key={f.name}
              type="button"
              role="tab"
              aria-selected={filter === f.name}
              className={`pj-filter ${filter === f.name ? 'is-active' : ''}`}
              onClick={() => changeFilter(f.name)}
            >
              {filter === f.name && (
                <motion.span layoutId="pj-filter-pill" className="pj-filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
              )}
              <span className="pj-filter-label">
                {f.name === 'Favorite' ? 'Favorites' : f.name}
                <em>{f.count}</em>
              </span>
            </button>
          ))}
        </div>
        <label className="pj-search">
          <FiSearch />
          <input
            type="search"
            placeholder="Search projects"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
          />
        </label>
      </section>

      {/* GRID */}
      <section className="pj-grid" key={`${filter}-${deferredQuery}`}>
        {shown.map((project, i) => (
          <motion.article
            key={project.link}
            className="pj-card"
            data-favorite={project.favorite ? project.link : undefined}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            custom={i % 3}
          >
            <button
              type="button"
              className="pj-card-inner"
              onClick={() => setActive(project)}
              onPointerMove={handleTilt}
              onPointerLeave={resetTilt}
              aria-label={`Open details for ${project.title}`}
            >
              <div className="pj-card-media">
                <img src={project.src.desktop} alt={project.alt} loading="lazy" decoding="async" width="640" height="360" />
                {project.favorite && <span className="pj-badge"><HiSparkles /> Favorite</span>}
              </div>
              <div className="pj-card-body">
                <div className="pj-tags">
                  {project.categories.filter((c) => c !== 'Favorite').map((cat) => (
                    <span className="pj-tag" key={cat}>{cat}</span>
                  ))}
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <span className="pj-card-cta">
                  View details <FiArrowUpRight />
                </span>
              </div>
              <span className="pj-card-shine" aria-hidden="true"></span>
            </button>
          </motion.article>
        ))}
      </section>

      {filtered.length === 0 && (
        <p className="pj-empty">No projects match “{query}”. Try another keyword.</p>
      )}

      {visible < filtered.length && (
        <div className="pj-more">
          <button type="button" className="pj-btn pj-btn-ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            <FiPlus /> Show more ({filtered.length - visible} left)
          </button>
        </div>
      )}

      <AnimatePresence>
        {active && <ProjectModal project={active} onClose={closeModal} />}
      </AnimatePresence>
    </div>
  );
}

export default Projects;
