const footerColumns = [
  {
    title: 'Network',
    links: ['Use Cases', 'CA Portal', 'API', 'Status'],
  },
  {
    title: 'Products',
    links: ['Verify', 'Hermes AI', 'CA Dashboard', 'Analytics'],
  },
  {
    title: 'Developers',
    links: ['Docs', 'GitHub', 'SDK', 'Subgraph'],
  },
  {
    title: 'Governance',
    links: ['Forum', 'Snapshot', 'Treasury', 'Proposals'],
  },
  {
    title: 'Community',
    links: ['Discord', 'Twitter', 'Blog', 'Events'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Press', 'Contact'],
  },
]

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-20 pt-16 md:pt-20 pb-8 md:pb-10">
        {/* Top Row - Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/30 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] my-10" />

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            2025 HalalChain Protocol. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-white/30">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
