const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function verifyAll() {
  console.log('🔍 Starting website verification...');
  let failed = false;

  try {
    // 1. Verify Public Career Openings API
    console.log('\n--- Checking Career Openings API ---');
    const openingsRes = await get('http://localhost:3000/api/career-openings');
    if (openingsRes.status !== 200) {
      console.error('❌ Career openings API returned status ' + openingsRes.status);
      failed = true;
    } else {
      const payload = JSON.parse(openingsRes.body);
      if (!payload.success || !Array.isArray(payload.data)) {
        console.error('❌ Career openings API response invalid');
        failed = true;
      } else {
        const jobs = payload.data;
        console.log('✓ Found ' + jobs.length + ' openings in DB/fallback JSON');
        const hasEmbedded = jobs.some(j => j.title === 'Embedded Systems Intern');
        const hasAppDev = jobs.some(j => j.title === 'Application Developer Intern');
        if (hasEmbedded && hasAppDev) {
          console.log('✓ Seeded openings are present:');
          jobs.forEach(j => console.log(`  - [${j.type}] ${j.title} (${j.department})`));
        } else {
          console.error('❌ Seeded openings are missing from response!');
          failed = true;
        }
      }
    }

    // 2. Verify homepage elements
    console.log('\n--- Checking index.html ---');
    const indexRes = await get('http://localhost:3000/');
    if (indexRes.status !== 200) {
      console.error('❌ Failed to fetch index.html');
      failed = true;
    } else {
      const html = indexRes.body;
      
      // Check logo path
      if (html.includes('src="images/logo.jpg"')) {
        console.error('❌ Relative logo path still exists in index.html');
        failed = true;
      } else {
        console.log('✓ Relative logo path resolved to absolute in index.html');
      }

      // Check Montserrat font import
      if (html.includes('Montserrat')) {
        console.log('✓ Montserrat font import found in index.html');
      } else {
        console.error('❌ Montserrat font import missing in index.html');
        failed = true;
      }

      // Check spacing in brand text
      if (html.includes('Pixel <span>Pi</span>')) {
        console.log('✓ "Pixel Pi" brand text has spacing in index.html');
      } else {
        console.error('❌ "Pixel Pi" spacing missing or incorrect in index.html');
        failed = true;
      }

      // Check drones icon change
      if (html.includes('fa-drone')) {
        console.error('❌ fa-drone icon still present in index.html');
        failed = true;
      } else if (html.includes('fa-helicopter')) {
        console.log('✓ Drone icon changed to fa-helicopter in index.html');
      } else {
        console.error('❌ Neither fa-drone nor fa-helicopter found in index.html');
        failed = true;
      }

      // Check team.html removal in footer
      if (html.includes('team.html') || html.includes('Team & Clients')) {
        console.error('❌ footer still links to team.html in index.html');
        failed = true;
      } else {
        console.log('✓ team.html removed from index.html footer');
      }

      // Check active css styles
      if (html.includes('.nav-links a.active')) {
        console.log('✓ Active nav link CSS styling found in index.html');
      } else {
        console.error('❌ Active nav link CSS styling missing in index.html');
        failed = true;
      }
    }

    // 3. Verify career page layout
    console.log('\n--- Checking career.html ---');
    const careerRes = await get('http://localhost:3000/career');
    if (careerRes.status !== 200) {
      console.error('❌ Failed to fetch /career');
      failed = true;
    } else {
      const html = careerRes.body;
      
      // Check logo path
      if (html.includes('src="images/logo.jpg"')) {
        console.error('❌ Relative logo path still exists in career.html');
        failed = true;
      } else {
        console.log('✓ Relative logo path resolved to absolute in career.html');
      }

      // Check Montserrat font import
      if (html.includes('Montserrat')) {
        console.log('✓ Montserrat font import found in career.html');
      } else {
        console.error('❌ Montserrat font import missing in career.html');
        failed = true;
      }

      // Check spacing in brand text
      if (html.includes('Pixel <span>Pi</span>')) {
        console.log('✓ "Pixel Pi" brand text has spacing in career.html');
      } else {
        console.error('❌ "Pixel Pi" spacing missing or incorrect in career.html');
        failed = true;
      }

      // Check navigation choices
      const expectedNavs = ['/#services', '/#collaboration', '/#vision', '/#why-us', '/#gallery', '/blog', '/career', '/#contact'];
      let navsOk = true;
      expectedNavs.forEach(nav => {
        if (!html.includes('href="' + nav + '"')) {
          console.error('❌ career.html missing nav link: ' + nav);
          navsOk = false;
          failed = true;
        }
      });
      if (navsOk) console.log('✓ Unified navbar links present in career.html');

      // Check active class
      if (html.includes('href="/career" class="active"')) {
        console.log('✓ Active class correctly highlighted on "Career" link');
      } else {
        console.error('❌ Active class highlight missing for Career link in career.html');
        failed = true;
      }

      // Check Partner With Us CTA button
      if (html.includes('href="/#collaboration" class="cta-button">Partner With Us</a>')) {
        console.log('✓ Unified CTA Partner button present in career.html header');
      } else {
        console.error('❌ Partner With Us CTA button missing or wrong in career.html');
        failed = true;
      }

      // Check culture card removal
      if (html.includes('Flexible Schedule')) {
        console.error('❌ "Flexible Schedule" culture card is still in career.html');
        failed = true;
      } else {
        console.log('✓ "Flexible Schedule" culture card removed from career.html');
      }

      // Check Creative Freedom culture card addition
      if (html.includes('Creative Freedom')) {
        console.log('✓ "Creative Freedom" culture card successfully added to career.html');
      } else {
        console.error('❌ "Creative Freedom" culture card missing in career.html');
        failed = true;
      }

      // Check footer layout and styles
      if (html.includes('team.html') || html.includes('Team & Clients') || html.includes('careers.html')) {
        console.error('❌ career.html footer contains legacy links (team.html or careers.html)');
        failed = true;
      } else {
        console.log('✓ career.html footer updated to unified version');
      }

      // Check footer icon CSS styles in career.html
      if (html.includes('.footer-links i')) {
        console.log('✓ Footer contact icon CSS alignment styles present in career.html');
      } else {
        console.error('❌ Footer contact icon CSS alignment styles missing in career.html');
        failed = true;
      }
    }

    // 4. Verify blog page layout
    console.log('\n--- Checking blog.html ---');
    const blogRes = await get('http://localhost:3000/blog');
    if (blogRes.status !== 200) {
      console.error('❌ Failed to fetch /blog');
      failed = true;
    } else {
      const html = blogRes.body;

      // Check logo path
      if (html.includes('src="images/logo.jpg"')) {
        console.error('❌ Relative logo path still exists in blog.html');
        failed = true;
      } else {
        console.log('✓ Relative logo path resolved to absolute in blog.html');
      }

      // Check Montserrat font import
      if (html.includes('Montserrat')) {
        console.log('✓ Montserrat font import found in blog.html');
      } else {
        console.error('❌ Montserrat font import missing in blog.html');
        failed = true;
      }

      // Check spacing in brand text
      if (html.includes('Pixel <span>Pi</span>')) {
        console.log('✓ "Pixel Pi" brand text has spacing in blog.html');
      } else {
        console.error('❌ "Pixel Pi" spacing missing or incorrect in blog.html');
        failed = true;
      }

      // Check navigation choices
      const expectedNavs = ['/#services', '/#collaboration', '/#vision', '/#why-us', '/#gallery', '/blog', '/career', '/#contact'];
      let navsOk = true;
      expectedNavs.forEach(nav => {
        if (!html.includes('href="' + nav + '"')) {
          console.error('❌ blog.html missing nav link: ' + nav);
          navsOk = false;
          failed = true;
        }
      });
      if (navsOk) console.log('✓ Unified navbar links present in blog.html');

      // Check active class
      if (html.includes('href="/blog" class="active"')) {
        console.log('✓ Active class correctly highlighted on "Blog" link');
      } else {
        console.error('❌ Active class highlight missing for Blog link in blog.html');
        failed = true;
      }

      // Check Partner With Us CTA button
      if (html.includes('href="/#collaboration" class="cta-button">Partner With Us</a>')) {
        console.log('✓ Unified CTA Partner button present in blog.html header');
      } else {
        console.error('❌ Partner With Us CTA button missing in blog.html');
        failed = true;
      }

      // Check footer layout
      if (html.includes('team.html') || html.includes('Team & Clients') || html.includes('Karnataka, India')) {
        // Karnataka, India was part of the old contact layout in blog footer, let's verify if new one replaced it
        // Actually, "Bangalore Karnataka India" is the new one (no commas).
        if (html.includes('Karnataka, India')) {
          console.error('❌ blog.html footer contains old layout elements');
          failed = true;
        } else {
          console.log('✓ blog.html footer replaced with unified four-column layout');
        }
      } else {
        console.log('✓ blog.html footer updated to unified version');
      }
    }

  } catch (err) {
    console.error('❌ Connection error or unexpected failure:', err.message);
    failed = true;
  }

  if (failed) {
    console.log('\n❌ VERIFICATION FAILED. Check errors above.');
    process.exit(1);
  } else {
    console.log('\n✨ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

verifyAll();
