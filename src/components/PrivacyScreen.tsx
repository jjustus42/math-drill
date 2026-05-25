import type { Screen } from '../types';

interface PrivacyScreenProps {
  setScreen: (screen: Screen) => void;
  showMainMenu: boolean;
}

export default function PrivacyScreen({ setScreen, showMainMenu }: PrivacyScreenProps) {
  return (
    <div className="privacy-screen">
      <h1>Privacy Policy</h1>
      <p><b>Data Collection:</b>  This application does not collect, store, use, or share any personal information.  All user data remains on your device and is not transmitted over the Internet.</p>
      <br></br>
      <p><b>Third-Party Services:</b>  While we do not collect data, you may use third-party servicess such as GitHub to access this application.  These services have their own privacy policies regarding your usage on their platforms.  Please see <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement#data-privacy-framework-dpf">GitHub's General Privacy Statement</a> for more information.</p>
      {!showMainMenu && (
        <button onClick={() => setScreen('home')}>Back to Home</button>
      )}
    </div>
  );
}
