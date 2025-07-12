import React from "react";
import { useParams } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function Dashboard() {
  const { id } = useParams<{ id?: string }>();
  const dashboardId = id ? parseInt(id) : 1; // Default to dashboard 1
  const isConsolidatedDashboard = dashboardId === 1; // Dashboard 1 is consolidated read-only
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <DashboardLayout dashboardId={dashboardId}>
      <DashboardContent 
        dashboardId={dashboardId} 
        isConsolidatedDashboard={isConsolidatedDashboard}
      />
    </DashboardLayout>
  );
}