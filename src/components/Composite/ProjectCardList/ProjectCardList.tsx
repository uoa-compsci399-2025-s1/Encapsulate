import React from 'react'
import type { ReactNode } from 'react'
import ProjectCard from '@/components/Generic/ProjectCard/ProjectCard'
import type { ProjectDetails } from '@/types/Project'

interface ProjectListProps {
  className?: string
  headingClassName?: string
  heading: string
  projects: ProjectDetails[]
  type?: 'student' | 'admin' | 'client'
  icon?: ReactNode
  loading?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onDelete?: (projectId: string) => Promise<{
    error?: string
    message?: string
  }>
  deleted?: () => void
}

const ProjectCardList: React.FC<ProjectListProps> = ({
  className,
  headingClassName,
  heading,
  projects,
  type = 'admin',
  loading = false,
  onDelete,
  deleted,
  icon,
  onClick,
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="flex flex-start">
        <h2 className={`text-dark-blue font-inter ${headingClassName}`}>{heading}</h2>
        {icon && (
          <span
            className="self-center pl-4 text-xl text-dark-blue hover:text-steel-blue hover:cursor-pointer"
            onClick={onClick}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 overflow-x-visible overflow-y-auto max-h-[490px] p-[1px] pt-0.5 pb-3">
        {loading ? (
          <p className="text-dark-blue">Loading Projects...</p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              projectInfo={project}
              type={type}
              onDelete={onDelete}
              deleted={deleted}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectCardList
