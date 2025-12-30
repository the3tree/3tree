import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Home", href: "/" },
  {
    name: "About",
    href: "/about",
    children: [
      { name: "Our Story & Vision", href: "/our-story" },
      { name: "Meet The Team", href: "/team" },
      { name: "Join The Team", href: "/join-team" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "Specialities", href: "/specialities" },
      { name: "Counselling Types", href: "/counselling-types" },
      { name: "Counselling Modes", href: "/counselling-modes" },
      {
        name: "Support We Offer",
        href: "/support",
        children: [
          { name: "Supervision For Therapists", href: "/supervision-therapists" },
          { name: "Support For Businesses", href: "/support-businesses" },
          { name: "Support For Schools & Institutions", href: "/support-schools" },
          { name: "Support Workshops", href: "/support-workshops" },
        ],
      },
    ],
  },
  {
    name: "Resources",
    href: "/resources",
    children: [
      { name: "Assessments", href: "/assessments" },
      { name: "Downloadable Guides", href: "/guides" },
      { name: "A To Z Topics", href: "/topics" },
    ],
  },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] bg-[#F5F1ED] border-b border-gray-200 shadow-sm">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif text-lg">3</span>
          </div>
          <span className="font-serif text-xl text-foreground">
            The <span className="italic">3</span> Tree
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navigation.map((item) =>
            item.children ? (
              <DropdownMenu key={item.name}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    style={{ boxShadow: 'none', outline: 'none' }}
                    className={`text-lg font-medium !outline-0 !outline-none !ring-0 !shadow-none focus:!outline-0 focus:!ring-0 focus:!shadow-none focus-visible:!outline-0 focus-visible:!ring-0 focus-visible:!ring-offset-0 active:!outline-0 active:!ring-0 ${
                      isActive(item.href) ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-64 p-2 bg-white shadow-xl border-gray-100 rounded-xl"
                  sideOffset={8}
                >
                  {item.children.map((child) =>
                    child.children ? (
                      <DropdownMenuSub key={child.name}>
                        <DropdownMenuSubTrigger className="flex items-center justify-between w-full p-3 text-base font-medium rounded-lg hover:bg-gray-50 cursor-pointer outline-none">
                          {child.name}
                          <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-64 p-2 bg-white shadow-xl border-gray-100 rounded-xl">
                          {child.children.map((subChild) => (
                            <DropdownMenuItem key={subChild.name} asChild className="p-0 mb-1 last:mb-0 focus:bg-transparent">
                              <Link
                                to={subChild.href}
                                className={`block p-3 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors ${
                                  isActive(subChild.href) ? "text-accent bg-gray-50" : "text-gray-700"
                                }`}
                              >
                                {subChild.name}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ) : (
                      <DropdownMenuItem key={child.name} asChild className="p-0 mb-1 last:mb-0 focus:bg-transparent">
                        <Link
                          to={child.href}
                          className={`block p-3 text-base font-medium rounded-lg hover:bg-gray-50 transition-colors ${
                            isActive(child.href) ? "text-accent bg-gray-50" : "text-gray-700"
                          }`}
                        >
                          {child.name}
                        </Link>
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className={`text-lg font-medium ${
                  isActive(item.href) ? "text-accent" : "text-foreground"
                }`}
              >
                <Link to={item.href}>{item.name}</Link>
              </Button>
            )
          )}
        </div>



        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <div className="container mx-auto py-4 px-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  to={item.href}
                  className={`block py-2 text-base font-medium ${
                    isActive(item.href) ? "text-accent" : "text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`block py-1.5 text-sm ${
                          isActive(child.href)
                            ? "text-accent"
                            : "text-muted-foreground"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      )}
    </header>
  );
}
