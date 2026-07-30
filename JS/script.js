// ---------- Tema claro/escuro ----------
// O tema já foi aplicado antes da renderização (script inline no <head>),
// aqui só cuidamos da troca ao clicar e de salvar a preferência.
(function () {
    const root = document.documentElement;
    const toggles = [
        document.getElementById('themeToggle'),
        document.getElementById('themeToggleMobile')
    ].filter(Boolean);

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem('hod-theme', theme);
        toggles.forEach(btn => btn.setAttribute('aria-pressed', theme === 'dark'));
    }

    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    });

    // Se o usuário nunca escolheu um tema manualmente, acompanha mudanças
    // na preferência do sistema operacional em tempo real.
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('hod-theme')) {
                root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }
})();

// Navbar scroll behavior
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile menu
const burger = document.getElementById('burgerBtn');
const panel = document.getElementById('mobilePanel');
const closeBtn = document.getElementById('closeBtn');
burger.addEventListener('click', () => panel.classList.add('open'));
closeBtn.addEventListener('click', () => panel.classList.remove('open'));
panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => panel.classList.remove('open')));

// Detecta preferência por movimento reduzido para desativar efeitos extras
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

// ---------- Scroll reveal com stagger por seção ----------
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.15 });

// Aplica um pequeno delay progressivo aos cards dentro do mesmo grupo,
// criando um efeito cascata em vez de tudo aparecer ao mesmo tempo.
function applyStagger(selector, step = 90) {
    document.querySelectorAll(selector).forEach((group) => {
        Array.from(group.children).forEach((child, i) => {
            if (child.classList.contains('reveal') || child.classList.contains('about-card') || child.classList.contains('service-card')) {
                child.classList.add('reveal');
                child.style.transitionDelay = `${i * step}ms`;
            }
        });
    });
}
applyStagger('.about-cards', 80);
applyStagger('.services-grid', 80);
applyStagger('.diff-grid', 80);

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Parallax multi-camada (hero) ----------
// Inclui as formas flutuantes originais + os novos círculos de "bokeh"
// (efeito de luz desfocada, referência direta ao universo fotográfico/audiovisual da marca).
const heroFxShapes = document.querySelectorAll('.hero-shape, .bokeh');
const heroBlob = document.querySelector('.hero-blob');
const heroBox = document.getElementById('heroParallax');
const heroBadge = document.querySelector('.hero-badge');
const heroTilt = document.getElementById('heroTilt');

let scrollY = 0;
let mouseX = 0, mouseY = 0;
let ticking = false;

function renderParallax() {
    ticking = false;

    heroFxShapes.forEach(shape => {
        const depth = parseFloat(shape.dataset.depth) || 0.03;
        const moveY = scrollY * depth;
        const moveX = mouseX * depth * 40;
        shape.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });

    if (heroBlob) {
        const depth = parseFloat(heroBlob.dataset.depth) || 0.02;
        heroBlob.style.transform = `translate3d(${mouseX * 24}px, ${scrollY * depth}px, 0) rotate(${mouseX * 3}deg)`;
    }

    if (heroBox) {
        const depth = parseFloat(heroBox.dataset.depth) || 0.05;
        heroBox.style.transform = `translate3d(${mouseX * -10}px, ${scrollY * depth}px, 0)`;
    }

    if (heroBadge) {
        const depth = parseFloat(heroBadge.dataset.depth) || 0.09;
        heroBadge.style.transform = `translate3d(${mouseX * 14}px, ${mouseY * 10}px, 0)`;
    }
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(renderParallax);
        ticking = true;
    }
}

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    requestTick();
});

if (!prefersReducedMotion && !isTouch) {
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        requestTick();
    });

    // Tilt 3D suave no visual do hero e no mosaico "Sobre"
    [heroTilt, document.getElementById('aboutTilt')].forEach(el => {
        if (!el) return;
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.setProperty('--tiltX', `${py * -6}deg`);
            el.style.setProperty('--tiltY', `${px * 8}deg`);
        });
        el.addEventListener('mouseleave', () => {
            el.style.setProperty('--tiltX', `0deg`);
            el.style.setProperty('--tiltY', `0deg`);
        });
    });
}

// ---------- Spotlight que segue o mouse na seção CTA ----------
const ctaSection = document.getElementById('ctaSection');
const ctaSpotlight = document.getElementById('ctaSpotlight');
if (ctaSection && ctaSpotlight && !prefersReducedMotion && !isTouch) {
    ctaSection.addEventListener('mousemove', (e) => {
        const rect = ctaSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctaSpotlight.style.setProperty('--spotX', `${x}px`);
        ctaSpotlight.style.setProperty('--spotY', `${y}px`);
        ctaSpotlight.style.opacity = '1';
    });
    ctaSection.addEventListener('mouseleave', () => {
        ctaSpotlight.style.opacity = '0';
    });
}

// ---------- Botões magnéticos (seguem levemente o cursor) ----------
if (!prefersReducedMotion && !isTouch) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ---------- Parallax suave nos cards do mosaico de projetos ----------
const projItemsParallax = document.querySelectorAll('.proj-item');
function renderProjectsParallax() {
    const vh = window.innerHeight;
    projItemsParallax.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
            const speed = (i % 3 === 0) ? 0.02 : (i % 3 === 1 ? -0.015 : 0.01);
            const offset = (rect.top - vh / 2) * speed;
            item.style.setProperty('--projParallax', `${offset}px`);
        }
    });
}

// Light parallax on hero image (mantido + integrado ao render geral)
window.addEventListener('scroll', () => {
    if (!prefersReducedMotion) renderProjectsParallax();
});

// Masonry real: posiciona cada card na coluna mais curta no momento,
// em vez de usar CSS columns (que deixa espaços em branco quando os itens são filtrados).
function layoutMasonry() {
    const container = document.querySelector('.masonry');
    if (!container) return;

    const items = Array.from(container.querySelectorAll('.proj-item'))
        .filter(el => !el.classList.contains('filtered-out'));

    if (!items.length) {
        container.style.height = '0px';
        return;
    }

    const gap = 36;
    const minColWidth = 260;
    const containerWidth = container.clientWidth;
    const cols = Math.max(1, Math.min(3, Math.floor((containerWidth + gap) / (minColWidth + gap))));
    const colWidth = (containerWidth - gap * (cols - 1)) / cols;
    const colHeights = new Array(cols).fill(0);

    items.forEach(item => {
        item.style.width = `${colWidth}px`;

        // Encontra a coluna mais curta no momento
        let shortest = 0;
        for (let i = 1; i < cols; i++) {
            if (colHeights[i] < colHeights[shortest]) shortest = i;
        }

        item.style.left = `${shortest * (colWidth + gap)}px`;
        item.style.top = `${colHeights[shortest]}px`;
        item.style.visibility = 'visible';

        colHeights[shortest] += item.offsetHeight + gap;
    });

    container.style.height = `${Math.max(...colHeights) - gap}px`;
    renderProjectsParallax();
}

window.addEventListener('load', layoutMasonry);

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutMasonry, 150);
});

// Filtro de projetos por categoria
const filterBtns = document.querySelectorAll('.filter-btn');
const projItems = document.querySelectorAll('.proj-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projItems.forEach(item => {
            const category = item.dataset.category;
            const show = filter === 'all' || category === filter;
            item.classList.toggle('filtered-out', !show);
        });

        layoutMasonry();
    });
});

// Encaminha os dados do formulário para o WhatsApp da HOD Creative.
const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(contactForm);
    const message = [
        'Olá! Gostaria de solicitar um orçamento.',
        '',
        `Nome: ${data.get('nome')}`,
        `Empresa: ${data.get('empresa') || 'Não informada'}`,
        `Telefone: ${data.get('telefone') || 'Não informado'}`,
        `E-mail: ${data.get('email')}`,
        `Serviço desejado: ${data.get('servico')}`,
        `Mensagem: ${data.get('mensagem') || 'Não informada'}`
    ].join('\n');

    window.open(`https://wa.me/5527997486896?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

// ---------- Parallax suave para glows fora do Hero ----------
const softGlows = document.querySelectorAll(
    '.about-bg .glow, .projects-bg span, .contact-bg span'
);

function renderSoftParallax() {
    const vh = window.innerHeight;
    softGlows.forEach((glow, i) => {
        const rect = glow.parentElement.getBoundingClientRect();
        // progresso de 0 a 1 conforme a seção passa pela tela
        const progress = 1 - (rect.top + rect.height / 2) / (vh + rect.height);
        const depth = 40 + (i % 3) * 20; // varia um pouco por elemento
        const offset = (progress - 0.5) * depth;
        glow.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
}

window.addEventListener('scroll', () => {
    if (!prefersReducedMotion) renderSoftParallax();
});
window.addEventListener('load', renderSoftParallax);


[['projetos', 'projects-spotlight'], ['contato', 'contact-spotlight']].forEach(([sectionId, spotClass]) => {
    const section = document.getElementById(sectionId);
    const spot = section?.querySelector(`.${spotClass}`);
    if (!section || !spot || prefersReducedMotion || isTouch) return;
    section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        spot.style.setProperty('--spotX', `${e.clientX - rect.left}px`);
        spot.style.setProperty('--spotY', `${e.clientY - rect.top}px`);
        spot.style.opacity = '1';
    });
    section.addEventListener('mouseleave', () => spot.style.opacity = '0');
});