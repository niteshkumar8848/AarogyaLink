const CopyrightBar = () => {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-teal-100 bg-white px-4 py-4 text-center text-xs text-teal-700">
      Copyright {year} AarogyaLink. All rights reserved.
    </div>
  );
};

export default CopyrightBar;
