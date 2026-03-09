"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { CourseMap } from "@/components/CourseMap";
import { getCourseWithProgress } from "@/lib/courseStore";

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;

  const course = useMemo(() => getCourseWithProgress(id), [id]);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-white/70 font-body">Course not found.</p>
        <a href="/" className="mt-4 text-teal hover:underline font-body">
          Back to home
        </a>
      </div>
    );
  }

  return <CourseMap course={course} />;
}
