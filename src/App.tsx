/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PublicCard from "./components/PublicCard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dynamic Admin dashboard console */}
        <Route path="/" element={<Dashboard />} />

        {/* Dynamic external read-only profile card */}
        <Route path="/card/:id" element={<PublicCard />} />

        {/* Standard routing redirect fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

