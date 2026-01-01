import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'//for testing interactive elems..
import Note from './Note'

test('renders content', () => {
    const note = {
        content: 'Component testing is done with react-testing-library',
        important: true
    }

    render(<Note note={note} />) //fn from react testing library

    const element = screen.getByText('Component testing is done with react-testing-library')
    expect(element).toBeDefined() //vitest's fn
})

test('clicking the button calls event handler once', async () => {
    const note = {
        content: 'Component testing is done with react-testing-library',
        important: true
    }

    const mockHandler = vi.fn()

    render(
        <Note note={note} toggleImportance={mockHandler} />
    )

    const user = userEvent.setup()
    const button = screen.getByText('make not important')
    await user.click(button)

    expect(mockHandler.mock.calls).toHaveLength(1) //The expectation of the test uses toHaveLength to verify that the mock function has been called exactly once:
}) 