import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";

// Home Page Sections - Using cleaned-up components
import Hero from "@/components/home/Hero";
import MindBodySoul from "@/components/home/MindBodySoul";
import ServicesCarousel from "@/components/home/ServicesCarousel";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowItWorks from "@/components/home/HowItWorks";
import AssessmentsHighlight from "@/components/home/AssessmentsHighlight";
import FounderMessage from "@/components/home/FounderMessage";
import CTASection from "@/components/home/CTASection";


/**
 * Home Page - Premium Landing
 * 
 * Sections:
 * 1. Hero (emotional narrative)
 * 2. Services Carousel (matching the3tree.com)
 * 3. Why Choose Us
 * 4. How It Works
 * 5. Assessments Highlight
 * 6. Final CTA
 * 
 * Note: Removed fake testimonials, fake e-books, fake shop items,
 * and fake download counts to keep the page authentic.
 */

export default function Index() {
    return (
        <>
            <Helmet>
                <title>The 3 Tree | We Help You Feel Seen, Heard, Understood</title>
                <meta
                    name="description"
                    content="We Help You Feel SEEN... HEARD... UNDERSTOOD... EMPOWERED... WHOLE... | A welcoming space to explore your thoughts, heal at your pace, and feel truly heard. Self Care isn't selfish."
                />
                <meta name="keywords" content="therapy, counseling, mental health, psychologist, anxiety, depression, online therapy, the 3 tree" />
                <link rel="canonical" href="https://the3tree.com" />

                {/* Open Graph */}
                <meta property="og:title" content="The 3 Tree | We Help You Feel Seen, Heard, Understood" />
                <meta property="og:description" content="A welcoming space to explore your thoughts, heal at your pace, and feel truly heard. Self Care isn't selfish." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://the3tree.com" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="The 3 Tree | We Help You Feel Seen, Heard, Understood" />
                <meta name="twitter:description" content="A welcoming space to explore your thoughts, heal at your pace, and feel truly heard." />
            </Helmet>

            <Layout>
                <main>
                    {/* 1. Hero with emotional narrative */}
                    <Hero />

                    {/* 2. Mind Body Soul - Animated philosophy section */}
                    <MindBodySoul />

                    {/* 3. Types of Therapy - Services Carousel */}
                    <ServicesCarousel />

                    {/* 4. Why Choose Us - Trust building */}
                    <WhyChooseUs />

                    {/* 5. Founder Message - Personal touch */}
                    <FounderMessage />

                    {/* 6. How It Works - Simple steps */}
                    <HowItWorks />

                    {/* 5. Assessments - Free tools */}
                    <AssessmentsHighlight />

                    {/* 6. Final CTA - Book session */}
                    <CTASection />
                </main>
            </Layout>
        </>
    );
}
