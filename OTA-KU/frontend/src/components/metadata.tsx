function Metadata({ title }: { title: string }) {
  return (
    <>
      <title>{title}</title>
      <meta property="og:title" content={title} />
      <meta property="twitter:title" content={title} />
    </>
  );
}

export default Metadata;
