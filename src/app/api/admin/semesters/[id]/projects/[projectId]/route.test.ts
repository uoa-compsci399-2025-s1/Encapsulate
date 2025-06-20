import { StatusCodes } from 'http-status-codes'
import {
  createMockNextPatchRequest,
  createMockNextRequest,
  paramsToPromise,
} from '@/test-config/utils'
import ProjectDataService from '@/data-layer/services/ProjectDataService'
import { semesterProjectCreateMock } from '@/test-config/mocks/Project.mock'
import { PATCH, DELETE } from '@/app/api/admin/semesters/[id]/projects/[projectId]/route'
import SemesterDataService from '@/data-layer/services/SemesterDataService'
import { semesterCreateMock, semesterMock } from '@/test-config/mocks/Semester.mock'
import { cookies } from 'next/headers'
import { AUTH_COOKIE_NAME } from '@/types/Auth'
import { adminToken, clientToken, studentToken } from '@/test-config/routes-setup'
import { ProjectStatus } from '@/types/Project'

describe('test api/semester/[id]/projects[/projectId]', async () => {
  const projectDataService = new ProjectDataService()
  const semesterDataService = new SemesterDataService()
  const cookieStore = await cookies()

  describe('test PATCH /api/semesters/[id]/projects/[projectId]', () => {
    it('return 401 with no auth', async () => {
      const res = await PATCH(createMockNextPatchRequest('', { semesterProjectCreateMock }), {
        params: paramsToPromise({ id: '123', projectId: '123' }),
      })
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
      expect((await res.json()).error).toBe('No token provided')
    })

    it('return 401 if not admin', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, clientToken)
      const res = await PATCH(createMockNextPatchRequest('', { semesterProjectCreateMock }), {
        params: paramsToPromise({ id: '123', projectId: '123' }),
      })
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
      expect((await res.json()).error).toBe('No scope')

      cookieStore.set(AUTH_COOKIE_NAME, studentToken)
      const res2 = await PATCH(createMockNextPatchRequest('', { semesterProjectCreateMock }), {
        params: paramsToPromise({ id: '123', projectId: '123' }),
      })
      expect(res2.status).toBe(StatusCodes.UNAUTHORIZED)
      expect((await res2.json()).error).toBe('No scope')
    })

    it("Should return a 404 error if the semester doesn't exist", async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const res = await PATCH(createMockNextPatchRequest('api/semesters/123/projects/123', {}), {
        params: paramsToPromise({ id: '123', projectId: '123' }),
      })
      expect(res.status).toBe(StatusCodes.NOT_FOUND)
      expect((await res.json()).error).toBe('Semester not found')
    })

    it("Should return a 404 error if the project doesn't exist", async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semester = await semesterDataService.createSemester(semesterMock)
      const res = await PATCH(createMockNextPatchRequest('', {}), {
        params: paramsToPromise({ id: semester.id, projectId: '123' }),
      })
      expect(res.status).toBe(StatusCodes.NOT_FOUND)
      expect((await res.json()).error).toBe('Project not found')
    })

    it('Should return a 404 error if the project is not in the semester', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semester = await semesterDataService.createSemester(semesterMock)
      const semesterProject = await projectDataService.createSemesterProject({
        ...semesterProjectCreateMock,
        semester: semester.id,
      })
      const res = await PATCH(
        createMockNextPatchRequest(`api/semesters/123/projects/${semesterProject.id}`, {
          number: 100,
        }),
        {
          params: paramsToPromise({ id: '123', projectId: semesterProject.id }),
        },
      )
      expect(res.status).toBe(StatusCodes.NOT_FOUND)
      expect((await res.json()).error).toBe('Semester not found')
    })

    it('Should return a 200 response with the project if it exists in the semester', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semester = await semesterDataService.createSemester(semesterMock)
      const semesterProject = await projectDataService.createSemesterProject({
        ...semesterProjectCreateMock,
        semester: semester.id,
      })
      const res = await PATCH(
        createMockNextPatchRequest(`api/semesters/${semester.id}/projects/${semesterProject.id}`, {
          number: 100,
        }),
        {
          params: paramsToPromise({ id: semester.id, projectId: semesterProject.id }),
        },
      )
      expect(res.status).toBe(StatusCodes.OK)
      expect((await res.json()).data).toEqual(
        await projectDataService.getSemesterProject(semesterProject.id),
      )
    })

    it('should not update numbering if a different project data field is updated', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semester = await semesterDataService.createSemester(semesterMock)
      const semesterProject = await projectDataService.createSemesterProject({
        ...semesterProjectCreateMock,
        semester: semester.id,
        status: ProjectStatus.Approved,
        number: 123,
      })
      const res = await PATCH(
        createMockNextPatchRequest(`api/semesters/${semester.id}/projects/${semesterProject.id}`, {
          name: 'Updated Project Name',
        }),
        {
          params: paramsToPromise({ id: semester.id, projectId: semesterProject.id }),
        },
      )
      expect((await res.json()).data.number).toEqual(123)
    })

    it('should update the number field if status is not updated', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semester = await semesterDataService.createSemester(semesterMock)
      const semesterProject = await projectDataService.createSemesterProject({
        ...semesterProjectCreateMock,
        semester: semester.id,
        status: ProjectStatus.Approved,
        number: 123,
      })
      const res = await PATCH(
        createMockNextPatchRequest(`api/semesters/${semester.id}/projects/${semesterProject.id}`, {
          number: 200,
        }),
        {
          params: paramsToPromise({ id: semester.id, projectId: semesterProject.id }),
        },
      )
      expect((await res.json()).data.number).toEqual(200)
    })
  })

  describe('test DELETE /api/semesters/[id]/projects/[projectId]', async () => {
    it('return 401 with no auth', async () => {
      const res = await DELETE(createMockNextRequest(`api/semesters/123/projects/123`), {
        params: paramsToPromise({ id: '123', projectId: '123' }),
      })
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
      expect((await res.json()).error).toBe('No token provided')
    })

    it('return 401 if not admin', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, clientToken)
      const res = await DELETE(createMockNextRequest(`api/semesters/123/projects/123`), {
        params: paramsToPromise({ id: '123', projectId: '123' }),
      })
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
      expect((await res.json()).error).toBe('No scope')

      cookieStore.set(AUTH_COOKIE_NAME, studentToken)
      const res2 = await DELETE(createMockNextRequest(`api/semesters/123/projects/123`), {
        params: paramsToPromise({ id: '123', projectId: '123' }),
      })
      expect(res2.status).toBe(StatusCodes.UNAUTHORIZED)
      expect((await res2.json()).error).toBe('No scope')
    })

    it('not found - delete project by non existent project ID', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semesterDataService = new SemesterDataService()
      const createdSemester = await semesterDataService.createSemester(semesterMock)
      const id = createdSemester.id
      const res = await DELETE(
        createMockNextRequest(`api/semesters/${id}/projects/'non-existent'`),
        {
          params: paramsToPromise({ id: createdSemester.id, projectId: 'non-existent' }),
        },
      )
      expect(res.status).toBe(StatusCodes.NOT_FOUND)
      const jsonResponse = await res.json()
      expect(jsonResponse.error).toBe('Project not found')
    })

    it('not found - delete project by non existent semester ID', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const createdSemester = await semesterDataService.createSemester(semesterMock)
      const createdSemesterProject = await projectDataService.createSemesterProject({
        ...semesterProjectCreateMock,
        semester: createdSemester.id,
      })
      const projectId = createdSemesterProject.id
      const res = await DELETE(
        createMockNextRequest(`api/semesters/'non-existent'/projects/${projectId}`),
        {
          params: paramsToPromise({ id: 'non-existent', projectId: projectId }),
        },
      )
      expect(res.status).toBe(StatusCodes.NOT_FOUND)
      const jsonResponse = await res.json()
      expect(jsonResponse.error).toBe('Semester not found')
    })

    it('delete a semester project with affiliated semester', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semesterDataService = new SemesterDataService()
      const createdSemester = await semesterDataService.createSemester(semesterMock)
      const createdSemesterProject = await projectDataService.createSemesterProject({
        ...semesterProjectCreateMock,
        semester: createdSemester.id,
      })
      const id = createdSemester.id
      const projectId = createdSemesterProject.id
      const res = await DELETE(
        createMockNextRequest(`api/admin/semesters/${id}/projects/${projectId}`),
        {
          params: paramsToPromise({ id: createdSemester.id, projectId: createdSemesterProject.id }),
        },
      )
      expect(res.status).toBe(StatusCodes.OK)
    })

    it('bad request - delete a semester project with not affiliated semester', async () => {
      cookieStore.set(AUTH_COOKIE_NAME, adminToken)
      const semesterDataService = new SemesterDataService()
      const createdSemester = await semesterDataService.createSemester(semesterCreateMock)
      const createdSemesterProject = await projectDataService.createSemesterProject({
        ...semesterProjectCreateMock,
        semester: createdSemester.id,
      })
      const wrongSemester = await semesterDataService.createSemester(semesterMock)
      const id = wrongSemester.id
      const projectId = createdSemesterProject.id
      const res = await DELETE(
        createMockNextRequest(`api/admin/semesters/${id}/projects/${projectId}`),
        {
          params: paramsToPromise({ id: wrongSemester.id, projectId: createdSemesterProject.id }),
        },
      )
      expect(res.status).toBe(StatusCodes.BAD_REQUEST)
    })
  })
})
