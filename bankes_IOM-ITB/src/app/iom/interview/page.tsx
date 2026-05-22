"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List } from "lucide-react";
import SidebarIOM from "@/app/components/layout/sidebariom";
import { Toaster } from "sonner";
import dynamic from "next/dynamic";
import WeeklyCalendarView from "./components/WeeklyCalendarView";
import SlotListView from "./components/SlotListView";

export default function InterviewPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="bottom-right" richColors />
      <div className="hidden md:block w-64 shrink-0">
        <SidebarIOM activeTab="interview" />
      </div>

      <div className="flex-1 min-w-0 my-4 mx-4 pt-16 md:pt-0 md:my-8 md:mr-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Jadwal Wawancara</h1>
          
          <Card className="border p-1">
            <Tabs 
              defaultValue="calendar" 
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "calendar" | "list")}
              className="w-[180px]"
            >
              <TabsList className="grid grid-cols-2 h-9 w-full">
                <TabsTrigger value="calendar" className="px-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Kalender</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3 flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Daftar</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </Card>
        </div>

        {viewMode === "calendar" ? <WeeklyCalendarView /> : <SlotListView />}
      </div>
    </div>
  );
}