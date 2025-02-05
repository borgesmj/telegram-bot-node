import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "home",
  });
});

router.get("/about", (req, res) =>
  res.render("about", {
    title: "About me",
  })
);
router.get("/contact", (req, res) =>
  res.render("contact", {
    title: "Contact Page",
  })
);
router.get("/terminos-y-condiciones", (req, res) =>
  res.render("terminos-y-condiciones", {
    title: "Términos y condiciones",
  })
);
router.get("/politicas-de-privacidad", (req, res) =>
  res.render("politicas-de-privacidad", {
    title: "Politicas de privacidad",
  })
);

export default router;
