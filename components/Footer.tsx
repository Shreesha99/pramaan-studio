export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-16">
      <div className="max-w-[1200px] mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-600">
        <div>
          <h4 className="font-semibold mb-3 text-black">Company</h4>
          <ul className="space-y-1">
            <li>About</li>
            <li>Careers</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black">Help</h4>
          <ul className="space-y-1">
            <li>Customer Support</li>
            <li>Delivery Info</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black">FAQ</h4>
          <ul className="space-y-1">
            <li>Account</li>
            <li>Returns</li>
            <li>Payments</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-black">Resources</h4>
          <ul className="space-y-1">
            <li>Developers</li>
            <li>Terms & Conditions</li>
            <li>Instagram</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm pb-6">
        © 2025 Fashion Store
      </div>
    </footer>
  );
}
