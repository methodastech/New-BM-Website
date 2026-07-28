/* Project detail page scripts, ported from _source/project.html.
   All data rendering moved into ProjectDetail.jsx; the only remaining script
   is the shared 3D IAQ campus in the closing section. */
import { initCampus } from './projects.js'

export default function initProjectPage() {
  return initCampus()
}
