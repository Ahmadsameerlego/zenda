import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { SidebarArabic } from "./components/SidebarArabic";
import { TopbarArabic } from "./components/TopbarArabic";
import { DashboardArabic } from "./pages/DashboardArabic";
import { OrdersArabic } from "./pages/OrdersArabic";
import { OrderDetailsArabic } from "./pages/OrderDetailsArabic";
import { ProductsArabic } from "./pages/ProductsArabic";
import { CategoriesArabic } from "./pages/CategoriesArabic";
import { BrandsArabic } from "./pages/BrandsArabic";
import { ReturnsArabic } from "./pages/ReturnsArabic";
import { TeamArabic } from "./pages/TeamArabic";
import { StoreSettingsArabic } from "./pages/StoreSettingsArabic";
import { CustomersArabic } from "./pages/CustomersArabic";
import { CustomerDetailsArabic } from "./pages/CustomerDetailsArabic";
import AlertsArabic from "./pages/AlertsArabic";
import { cn } from "./components/ui/utils";
import { Login } from "./pages/Login";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AuthProvider } from "./context/AuthProvider";
import StorefrontHome from "./storefront/pages/StorefrontHome";
import StorefrontProducts from "./storefront/pages/StorefrontProducts";
import ProductDetails from "./storefront/pages/ProductDetails";
import CheckoutPage from "./storefront/pages/CheckoutPage";
import AboutUs from "./storefront/pages/AboutUs";
import InfoPage from "./storefront/pages/InfoPage";
import { ThemeProvider } from "./contexts/ThemeProvider";
import { AlertProvider } from "./context/AlertContext";

function DashboardLayout() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isRTL = language === "ar";

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        setMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set document direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 z-30 transform transition-transform duration-300",
          isRTL ? "right-0" : "left-0",
          mobileSidebarOpen
            ? "translate-x-0"
            : isRTL
              ? "translate-x-full"
              : "-translate-x-full"
        )}
      >
        <SidebarArabic
          isOpen={true}
          onToggle={() => setMobileSidebarOpen(false)}
          onClose={() => setMobileSidebarOpen(false)}
          language={language}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarArabic
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          language={language}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isRTL ? "lg:mr-64" : "lg:ml-64",
          !sidebarOpen && (isRTL ? "lg:mr-20" : "lg:ml-20")
        )}
      >
        <TopbarArabic
          onMenuClick={() => setMobileSidebarOpen(true)}
          language={language}
          onLanguageToggle={toggleLanguage}
        />

        <main className="pt-16 min-h-screen">
          <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<DashboardArabic language={language} />} />
              <Route path="/orders" element={<OrdersArabic language={language} />} />
              <Route path="/orders/:id" element={<OrderDetailsArabic language={language} />} />
              <Route path="/products" element={<ProductsArabic language={language} />} />
              <Route path="/alerts" element={<AlertsArabic language={language} />} />
              <Route path="/customers" element={<CustomersArabic language={language} />} />
              <Route path="/customers/:id" element={<CustomerDetailsArabic language={language} />} />
              <Route path="/categories" element={<CategoriesArabic language={language} />} />
              <Route path="/brands" element={<BrandsArabic language={language} />} />
              <Route path="/returns" element={<ReturnsArabic language={language} />} />
              <Route path="/team" element={<TeamArabic language={language} />} />
              <Route path="/settings" element={<StoreSettingsArabic language={language} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="zenda-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/store/:slug" element={<StorefrontHome />} />
            <Route path="/store/:slug/products" element={<StorefrontProducts />} />
            <Route path="/store/:slug/product/:productSlug" element={<ProductDetails />} />
            <Route path="/store/:slug/checkout" element={<CheckoutPage />} />
            <Route path="/store/:slug/about" element={<AboutUs />} />
            <Route path="/store/:slug/page/:pageKey" element={<InfoPage />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <AlertProvider>
                    <DashboardLayout />
                  </AlertProvider>
                </AuthGuard>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}