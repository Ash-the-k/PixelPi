import { Hero }                 from '../../components/public/sections/Hero';
import { Services }             from '../../components/public/sections/Services';
import { ProjectMetrics }       from '../../components/public/sections/ProjectMetrics';
import { Industries }           from '../../components/public/sections/Industries';
import { ProjectsTeaser }       from '../../components/public/sections/ProjectsTeaser';
import { CollaborationTeaser }  from '../../components/public/sections/CollaborationTeaser';
import { Newsletter }           from '../../components/public/sections/Newsletter';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Services />
      <ProjectMetrics />
      <Industries />
      <ProjectsTeaser />
      <CollaborationTeaser />
      <Newsletter />
    </div>
  );
}
