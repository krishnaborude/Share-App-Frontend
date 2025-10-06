import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SendForm from './SendForm'
import { ToastProvider } from './ToastContext'

test('renders send form and buttons', () => {
  render(
    <ToastProvider>
      <SendForm multiple={false} />
    </ToastProvider>
  )
  expect(screen.getByText(/Send One File/i)).toBeInTheDocument()
  const uploadButtons = screen.getAllByRole('button', { name: /Upload/i })
  // Ensure at least one of the matching buttons is the submit button
  expect(uploadButtons.some(b => b.getAttribute('type') === 'submit')).toBe(true)
})
