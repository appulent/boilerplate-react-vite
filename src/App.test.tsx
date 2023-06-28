import App from './App'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('App', () => {
  test('renders App component', async () => {
    render(<App />)

    expect(screen.queryByText('count is 0')).toBeInTheDocument()
    userEvent.click(screen.getByTestId('button'))
    await waitFor(() => expect(expect(screen.queryByText('count is 1')).toBeInTheDocument()))
  })
})
