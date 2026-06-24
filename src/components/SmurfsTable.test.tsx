import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SmurfsTable from './SmurfsTable'
import { smurfsData } from '../data/smurfs'

afterEach(() => {
  cleanup()
})

describe('SmurfsTable', () => {
  it('renders every smurf as a table row', () => {
    render(<SmurfsTable />)

    for (const smurf of smurfsData) {
      expect(screen.getByText(smurf.firstName)).toBeInTheDocument()
    }
  })

  it('moves the active cell with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<SmurfsTable />)

    const firstCell = screen.getByText(smurfsData[0].firstName).closest('td')
    expect(firstCell).toHaveClass('cell-active')

    firstCell?.focus()
    await user.keyboard('{ArrowDown}')

    const movedCell = screen.getByText(smurfsData[1].firstName).closest('td')
    expect(movedCell).toHaveClass('cell-active')
    expect(firstCell).not.toHaveClass('cell-active')
  })

  it('does not reformat the whole dataset when only the active cell changes', async () => {
    const formatSpy = vi.spyOn(Date.prototype, 'toLocaleString')
    const user = userEvent.setup()
    render(<SmurfsTable />)
    formatSpy.mockClear()

    const firstCell = screen.getByText(smurfsData[0].firstName).closest('td')
    firstCell?.focus()

    await user.keyboard('{ArrowDown}')

    // Moving the active cell should, at most, touch the smurf(s) involved
    // in the move - it should never re-format every row in the dataset.
    expect(formatSpy.mock.calls.length).toBeLessThan(smurfsData.length)

    formatSpy.mockRestore()
  })
})
