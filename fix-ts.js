const fs = require('fs');
const files = ['app/ui/store/hero-renderers.tsx', 'app/ui/store/section-renderer.tsx'];
files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/('--tw-ring-color': [^}]+) \} as React\.CSSProperties\}/g, '$1 } as any as React.CSSProperties}');
    fs.writeFileSync(f, c);
    console.log(f + ' fixed');
});
