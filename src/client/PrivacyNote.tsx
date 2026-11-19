// Shown under the landing form and under the room. Keep it true: the server
// keeps everything in memory only, and the app writes nothing to the browser
// (see forgetEmojiPickerData in FullEmojiPicker.tsx).
export function PrivacyNote() {
  return (
    <p className="privacy-note" data-testid="privacy-note">
      Nothing you enter here is tracked or stored, and everything will disappear when you close the browser tab.
    </p>
  );
}
