import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Nav,
  Navbar,
  Row,
  Spinner
} from "react-bootstrap";
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { createPost, fetchPaymentArticle, fetchPosts, loginUser, signupUser } from "./services/blogService";

const landingHighlights = [
  {
    title: "Immersive storytelling",
    description:
      "A polished reading experience with cinematic storytelling, elegant visuals, and fluid navigation."
  },
  {
    title: "Smart blog discovery",
    description:
      "Readers can jump between the main article, references, and contributor profiles in seconds."
  },
  {
    title: "Modern, responsive design",
    description:
      "Every section feels tailored for desktop, tablet, and mobile viewing with interactive touches."
  }
];

const sourceHighlights = [
  "Global digital payment adoption trends",
  "Consumer behavior in urban and rural marketplaces",
  "Comparative research on cash, card, and digital-wallet usage"
];

const contributorProfiles = [
  {
    name: "Angela Gabriel Basa",
    role: "Proofreader",
    bio: "Reviewed grammar, clarity, and consistency to ensure the article reads smoothly."
  },
  {
    name: "Kendrick Paul Castro",
    role: "Editor",
    bio: "Refined structure, tone, and flow so the final article felt polished and cohesive."
  },
  {
    name: "Beatrize Pearl Egoy",
    role: "Layout Artist",
    bio: "Designed the page layouts, visual hierarchy, and presentation of the article."
  }
];

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const [article, setArticle] = useState(null);
  const [articleError, setArticleError] = useState("");
  const [isArticleLoading, setIsArticleLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsError, setPostsError] = useState("");
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = window.localStorage.getItem("blogUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem("blogToken") || "";
  });
  const [authModal, setAuthModal] = useState({ open: false, mode: "signup", pendingRoute: "/home" });
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", excerpt: "", category: "Community", content: "" });
  const [postMessage, setPostMessage] = useState("");
  const [postError, setPostError] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await fetchPaymentArticle();
        setArticle(data);
      } catch (error) {
        setArticleError(error.message);
      } finally {
        setIsArticleLoading(false);
      }
    };

    loadArticle();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts(token);
        setPosts(Array.isArray(data) ? data : []);
      } catch (error) {
        setPostsError(error.message);
      } finally {
        setIsPostsLoading(false);
      }
    };

    if (token) {
      setIsPostsLoading(true);
      loadPosts();
      return;
    }

    setPosts([]);
    setPostsError("");
    setIsPostsLoading(false);
  }, [token]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (token) {
      window.localStorage.setItem("blogToken", token);
    } else {
      window.localStorage.removeItem("blogToken");
    }
  }, [token]);

  const openAuthModal = (pendingRoute = "/home", mode = "signup") => {
    setAuthError("");
    setAuthForm({ name: "", email: "", password: "" });
    setAuthModal({ open: true, mode, pendingRoute });
  };

  const closeAuthModal = () => {
    setAuthModal((current) => ({ ...current, open: false }));
    setAuthError("");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setIsAuthSubmitting(true);
    setAuthError("");

    try {
      const payload = {
        email: authForm.email.trim(),
        password: authForm.password
      };

      if (authModal.mode === "signup") {
        const response = await signupUser({
          ...payload,
          name: authForm.name.trim()
        });
        setUser(response.user);
        setToken(response.token);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("blogUser", JSON.stringify(response.user));
        }
      } else {
        const response = await loginUser(payload);
        setUser(response.user);
        setToken(response.token);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("blogUser", JSON.stringify(response.user));
        }
      }

      closeAuthModal();
      navigate(authModal.pendingRoute);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("blogUser");
      window.localStorage.removeItem("blogToken");
    }
    setPostMessage("");
    setPostError("");
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();

    if (!token || !user) {
      setPostError("Sign up or log in first so your article can be published.");
      openAuthModal("/home");
      return;
    }

    setIsPosting(true);
    setPostError("");
    setPostMessage("");

    try {
      const response = await createPost(
        {
          title: postForm.title.trim(),
          excerpt: postForm.excerpt.trim(),
          category: postForm.category.trim(),
          content: postForm.content.trim()
        },
        token
      );

      setPosts((current) => [response, ...current]);
      setPostForm({ title: "", excerpt: "", category: "Community", content: "" });
      setPostMessage("Your article is now live for readers.");
    } catch (error) {
      setPostError(error.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar expand="lg" className="top-nav py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="site-brand">
            GRAND BLOG
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto gap-lg-3 align-items-lg-center">
              <NavLink to="/" className="nav-link">
                Welcome
              </NavLink>
              <NavLink to="/home" className="nav-link">
                Home
              </NavLink>
              <NavLink to="/single-post" className="nav-link">
                Single Post
              </NavLink>
              <NavLink to="/sources" className="nav-link">
                Sources
              </NavLink>
              <NavLink to="/contributors" className="nav-link">
                Contributors
              </NavLink>
              {user ? (
                <Button variant="outline-secondary" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              ) : (
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={() => openAuthModal("/home", "login")}>
                    Log in
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => openAuthModal("/home", "signup")}>
                    Sign up
                  </Button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              user={user}
              onOpenAuth={openAuthModal}
            />
          }
        />
        <Route
          path="/home"
          element={
            <ContentPage
              article={article}
              articleError={articleError}
              isArticleLoading={isArticleLoading}
              variant="home"
              user={user}
              posts={posts}
              postsError={postsError}
              isPostsLoading={isPostsLoading}
              onOpenAuth={openAuthModal}
              onCreatePost={handleCreatePost}
              postForm={postForm}
              setPostForm={setPostForm}
              postMessage={postMessage}
              postError={postError}
              isPosting={isPosting}
            />
          }
        />
        <Route
          path="/single-post"
          element={
            <ContentPage
              article={article}
              articleError={articleError}
              isArticleLoading={isArticleLoading}
              variant="single-post"
              user={user}
              posts={posts}
              postsError={postsError}
              isPostsLoading={isPostsLoading}
              onOpenAuth={openAuthModal}
              onCreatePost={handleCreatePost}
              postForm={postForm}
              setPostForm={setPostForm}
              postMessage={postMessage}
              postError={postError}
              isPosting={isPosting}
            />
          }
        />
        <Route
          path="/sources"
          element={<SourcesPage article={article} articleError={articleError} isArticleLoading={isArticleLoading} />}
        />
        <Route
          path="/contributors"
          element={
            <ContributorsPage
              article={article}
              articleError={articleError}
              isArticleLoading={isArticleLoading}
            />
          }
        />
      </Routes>

      <AuthModal
        show={authModal.open}
        mode={authModal.mode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        isAuthSubmitting={isAuthSubmitting}
        onClose={closeAuthModal}
        onSubmit={handleAuthSubmit}
        onSwitchMode={() =>
          setAuthModal((current) => ({
            ...current,
            mode: current.mode === "signup" ? "login" : "signup"
          }))
        }
      />
    </div>
  );
}

function LandingPage({ user, onOpenAuth }) {
  return (
    <section className="landing-hero">
      <Container>
        <Row className="align-items-center g-5 py-5 py-lg-6">
          <Col lg={7}>
            <div className="landing-copy">
              <p className="eyebrow">A fresh, elegant digital journal</p>
              <h1 className="display-4 fw-bold mb-3">
                Discover stories that feel as vivid as real life.
              </h1>
              <p className="lead mb-4">
                Welcome to a beautifully crafted blog experience where every article invites reader curiosity through immersive visuals, smart navigation, and thoughtful storytelling.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Button onClick={() => onOpenAuth(user ? "/home" : "/home", "signup")} size="lg" className="btn-hero-primary">
                  Get Started
                </Button>
                <Button onClick={() => onOpenAuth(user ? "/single-post" : "/single-post", "login")} size="lg" variant="outline-light">
                  Explore the article
                </Button>
              </div>
              <p className="mt-3 mb-0 text-light-emphasis">
                Sign up or log in to publish your own blog articles and join the conversation.
              </p>
            </div>
          </Col>
          <Col lg={5}>
            <Card className="landing-card">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="pulse-pill">Live now</span>
                  <Badge bg="dark">New layout</Badge>
                </div>
                <h3 className="h5 fw-bold">Why readers stay longer</h3>
                <ul className="feature-list">
                  {landingHighlights.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function ContentPage({
  article,
  articleError,
  isArticleLoading,
  variant,
  user,
  posts,
  postsError,
  isPostsLoading,
  onOpenAuth,
  onCreatePost,
  postForm,
  setPostForm,
  postMessage,
  postError,
  isPosting
}) {
  if (isArticleLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 mb-0">Loading article...</p>
      </Container>
    );
  }

  if (articleError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{articleError}</Alert>
      </Container>
    );
  }

  const imageGallery = [
    {
      src: "/images/Pasted Image.png",
      alt: "A person reviewing digital payment options on a device",
      caption: "Digital payment choices are now woven into daily routines."
    },
    {
      src: "/images/Pasted Image 2.png",
      alt: "A customer choosing a checkout method at a store",
      caption: "Convenience and familiarity shape how people choose to pay."
    },
    {
      src: "/images/Pasted Image 3.png",
      alt: "A retail counter with multiple payment methods",
      caption: "Modern checkout experiences make each payment method visible and accessible."
    },
    {
      src: "/images/Pasted Image 4.png",
      alt: "A shopper comparing payment options in a social setting",
      caption: "These choices are often guided by trust, speed, and habit."
    }
  ];

  return (
    <>
      <header
        className="hero-header"
        style={{ backgroundImage: `url(${article.heroImageUrl})` }}
        id="home"
      >
        <div className="hero-overlay">
          <Container className="text-white text-center py-5">
            <p className="hero-category">{article.category}</p>
            <h1 className="display-5 fw-bold mb-3">{article.title}</h1>
            <p className="lead mb-2">{article.subtitle}</p>
            <small>
              Published on {article.publishedDate} Â· {article.readingTime}
            </small>
          </Container>
        </div>
      </header>

      <main className="py-5" id="article">
        <Container>
          <Card className="mb-4 glass-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                  <p className="eyebrow mb-2">Create and publish</p>
                  <h2 className="h4 fw-bold mb-2">Bring your own ideas to the blog</h2>
                  <p className="mb-0 text-muted">
                    {user
                      ? "Compose a new article and publish it to the community feed in moments."
                      : "Sign up or log in to unlock your first post and share your perspective with readers."}
                  </p>
                </div>
                {!user ? (
                  <Button variant="primary" onClick={() => onOpenAuth(variant === "single-post" ? "/single-post" : "/home", "signup")}>
                    Start writing
                  </Button>
                ) : null}
              </div>
            </Card.Body>
          </Card>

          {user ? (
            <Card className="mb-4 sidebar-card">
              <Card.Body>
                <h3 className="h5 fw-bold">Publish your own article</h3>
                {postMessage ? <Alert variant="success">{postMessage}</Alert> : null}
                {postError ? <Alert variant="danger">{postError}</Alert> : null}
                <Form onSubmit={onCreatePost}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          required
                          value={postForm.title}
                          onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))}
                          placeholder="What is your story about?"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                          value={postForm.category}
                          onChange={(event) => setPostForm((current) => ({ ...current, category: event.target.value }))}
                          placeholder="Community"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Short intro</Form.Label>
                        <Form.Control
                          value={postForm.excerpt}
                          onChange={(event) => setPostForm((current) => ({ ...current, excerpt: event.target.value }))}
                          placeholder="Give readers a preview of your post."
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label>Story</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          required
                          value={postForm.content}
                          onChange={(event) => setPostForm((current) => ({ ...current, content: event.target.value }))}
                          placeholder="Write the article you want other readers to discover."
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button type="submit" className="mt-3" disabled={isPosting}>
                    {isPosting ? <Spinner animation="border" size="sm" /> : "Publish article"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className="mb-4 sidebar-card">
              <Card.Body>
                <h3 className="h5 fw-bold">Already have an account?</h3>
                <p className="mb-2">
                  Sign in to start composing posts and share your thoughts with the readers who visit this journal.
                </p>
                <Button variant="outline-primary" onClick={() => onOpenAuth(variant === "single-post" ? "/single-post" : "/home", "login")}>
                  Log in
                </Button>
              </Card.Body>
            </Card>
          )}

          <Card className="mb-4 info-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                <div>
                  <h3 className="h5 fw-bold mb-1">Community posts</h3>
                  <p className="mb-0 text-muted">
                    Readers and authors can browse freshly published stories below.
                  </p>
                </div>
                {postsError ? <Badge bg="danger">{postsError}</Badge> : null}
              </div>
              {isPostsLoading ? (
                <div className="mt-3 text-center">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : posts.length === 0 ? (
                <p className="mt-3 mb-0">No posts yet. Be the first to publish one.</p>
              ) : (
                <Row className="g-3 mt-1">
                  {posts.map((post) => (
                    <Col md={6} key={post.id}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                          <Badge bg="secondary" className="mb-2">
                            {post.category}
                          </Badge>
                          <h4 className="h6 fw-bold">{post.title}</h4>
                          <p className="text-muted mb-2">{post.excerpt}</p>
                          <small className="text-muted">By {post.authorName}</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>

          {variant === "single-post" ? (
            <Row className="g-4">
              <Col lg={8}>
                <article className="article-body p-4 p-md-5">
                  <p className="standfirst">{article.standfirst}</p>
                  {article.sections.map((section) => (
                    <section key={section.heading} className="mb-4">
                      <h2 className="h4">{section.heading}</h2>
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {section.imageUrl ? (
                        <figure className="my-4">
                          <img
                            src={section.imageUrl}
                            alt={section.imageCaption || section.heading}
                            className="img-fluid rounded shadow-sm w-100"
                            style={{ maxHeight: "420px", objectFit: "cover" }}
                          />
                          {section.imageCaption ? (
                            <figcaption className="figure-caption text-center mt-2 text-muted fst-italic">
                              {section.imageCaption}
                            </figcaption>
                          ) : null}
                        </figure>
                      ) : null}
                    </section>
                  ))}
                  <blockquote className="feature-quote mt-4 mb-4">{article.highlightQuote}</blockquote>
                  <section>
                    <h2 className="h4">{article.didYouKnow.title}</h2>
                    <p>{article.didYouKnow.content}</p>
                  </section>
                </article>
              </Col>
              <Col lg={4}>
                <Card className="sidebar-card mb-3">
                  <Card.Body>
                    <Card.Title>About this post</Card.Title>
                    <p className="mb-2">
                      This article applies expository writing by presenting data, comparing payment choices, and explaining why Filipinos choose different methods.
                    </p>
                    <Badge bg="dark">{article.wordCount} words</Badge>
                  </Card.Body>
                </Card>
                <Card className="sidebar-card mb-3">
                  <Card.Body>
                    <Card.Title>Payment methods covered</Card.Title>
                    <ul className="mb-0">
                      {article.paymentMethods.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
                <Card className="sidebar-card">
                  <Card.Body>
                    <Card.Title>Call to reflection</Card.Title>
                    <p className="mb-0">{article.reflectionPrompt}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <Row className="g-4">
              <Col lg={8}>
                <article className="article-body p-4 p-md-5">
                  <p className="standfirst">{article.standfirst}</p>
                  {article.sections.map((section) => (
                    <section key={section.heading} className="mb-4">
                      <h2 className="h4">{section.heading}</h2>
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {section.imageUrl ? (
                        <figure className="my-4">
                          <img
                            src={section.imageUrl}
                            alt={section.imageCaption || section.heading}
                            className="img-fluid rounded shadow-sm w-100"
                            style={{ maxHeight: "420px", objectFit: "cover" }}
                          />
                          {section.imageCaption ? (
                            <figcaption className="figure-caption text-center mt-2 text-muted fst-italic">
                              {section.imageCaption}
                            </figcaption>
                          ) : null}
                        </figure>
                      ) : null}
                    </section>
                  ))}
                  <blockquote className="feature-quote mt-4 mb-4">{article.highlightQuote}</blockquote>
                  <section>
                    <h2 className="h4">{article.didYouKnow.title}</h2>
                    <p>{article.didYouKnow.content}</p>
                  </section>
                </article>
              </Col>
              <Col lg={4}>
                <Card className="sidebar-card mb-3">
                  <Card.Body>
                    <Card.Title>About this post</Card.Title>
                    <p className="mb-2">
                      This article applies expository writing by presenting data, comparing payment choices, and explaining why Filipinos choose different methods.
                    </p>
                    <Badge bg="dark">{article.wordCount} words</Badge>
                  </Card.Body>
                </Card>
                <Card className="sidebar-card mb-3">
                  <Card.Body>
                    <Card.Title>Payment methods covered</Card.Title>
                    <ul className="mb-0">
                      {article.paymentMethods.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </Card.Body>
                </Card>
                <Card className="sidebar-card">
                  <Card.Body>
                    <Card.Title>Call to reflection</Card.Title>
                    <p className="mb-0">{article.reflectionPrompt}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Row className="mt-4 g-4">
            <Col lg={7}>
              <Card id="references" className="info-card h-100">
                <Card.Body>
                  <Card.Title className="mb-3">APA 7th Edition Sources</Card.Title>
                  <ol className="mb-0 ps-3">
                    {article.references.map((reference) => (
                      <li key={reference} className="mb-2">
                        {reference}
                      </li>
                    ))}
                  </ol>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={5}>
              <Card id="roles" className="info-card h-100">
                <Card.Body>
                  <Card.Title className="mb-3">Members Roles and Contributions</Card.Title>
                  <ul className="mb-0">
                    {article.memberRoles.map((member) => (
                      <li key={member.name}>
                        <strong>{member.name}</strong> - {member.role}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
}

function SourcesPage({ article, articleError, isArticleLoading }) {
  if (isArticleLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 mb-0">Loading sources...</p>
      </Container>
    );
  }

  if (articleError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{articleError}</Alert>
      </Container>
    );
  }

  return (
    <section className="page-section py-5">
      <Container>
        <Row className="g-4 align-items-start">
          <Col lg={7}>
            <div className="section-intro">
              <p className="eyebrow">Reference library</p>
              <h2 className="display-6 fw-bold">The evidence behind the story.</h2>
              <p className="lead">
                Each source was selected to ground the article in practical research and real-world payment behavior.
              </p>
            </div>
            <Card className="glass-card">
              <Card.Body>
                <ol className="source-list">
                  {article.references.map((reference) => (
                    <li key={reference}>{reference}</li>
                  ))}
                </ol>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={5}>
            <Card className="sidebar-card">
              <Card.Body>
                <h3 className="h5 fw-bold">What this section covers</h3>
                <ul className="mb-0">
                  {sourceHighlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
            <Card className="sidebar-card mt-3">
              <Card.Body>
                <h3 className="h5 fw-bold">Reader takeaway</h3>
                <p className="mb-0">
                  The sources show how convenience, access, trust, and social habits all influence modern payment decisions.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
}

function ContributorsPage({ article, articleError, isArticleLoading }) {
  if (isArticleLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 mb-0">Loading contributors...</p>
      </Container>
    );
  }

  if (articleError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{articleError}</Alert>
      </Container>
    );
  }

  return (
    <section className="page-section py-5">
      <Container>
        <div className="section-intro text-center mb-4">
          <p className="eyebrow">Meet the team</p>
          <h2 className="display-6 fw-bold">A thoughtful group behind the story.</h2>
          <p className="lead mx-auto" style={{ maxWidth: "720px" }}>
            Each contributor helped shape the voice, structure, and presentation of the article so the final experience feels cohesive and memorable.
          </p>
        </div>
        <Row className="g-4">
          {contributorProfiles.map((person) => (
            <Col md={4} key={person.name}>
              <Card className="contributor-card h-100">
                <Card.Body>
                  <div className="avatar">{person.name.split(" ")[0][0]}</div>
                  <h3 className="h5 fw-bold mt-3">{person.name}</h3>
                  <p className="text-muted fw-semibold">{person.role}</p>
                  <p className="mb-0">{person.bio}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Card className="mt-4 sidebar-card">
          <Card.Body>
            <h3 className="h5 fw-bold">Member roles in the article</h3>
            <ul className="mb-0">
              {article.memberRoles.map((member) => (
                <li key={member.name}>
                  <strong>{member.name}</strong> â€” {member.role}
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </section>
  );
}

function AuthModal({ show, mode, authForm, setAuthForm, authError, isAuthSubmitting, onClose, onSubmit, onSwitchMode }) {
  const title = mode === "login" ? "Log in" : "Sign up";

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted">
          {mode === "signup"
            ? "Create an account to publish your own articles and join the community feed."
            : "Log in to keep writing and publish your next story in one place."}
        </p>
        {authError ? <Alert variant="danger">{authError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          {mode === "signup" ? (
            <Form.Group className="mb-3">
              <Form.Label>Your name</Form.Label>
              <Form.Control
                required
                value={authForm.name}
                onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Enter your full name"
              />
            </Form.Group>
          ) : null}
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              required
              value={authForm.email}
              onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              required
              value={authForm.password}
              onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Choose a secure password"
            />
          </Form.Group>
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <Button type="submit" disabled={isAuthSubmitting}>
              {isAuthSubmitting ? <Spinner animation="border" size="sm" /> : title}
            </Button>
            <Button variant="link" className="p-0" onClick={onSwitchMode} type="button">
              {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default App;
