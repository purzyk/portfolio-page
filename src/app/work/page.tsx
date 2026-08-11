import { redirect } from 'next/navigation'

/**
 * The home page is the work page — the two-pane window with the list in it. `/work`
 * exists only so a guessed URL resolves; the nav points at `/`.
 */
export default function WorkIndexRedirect() {
  redirect('/')
}
