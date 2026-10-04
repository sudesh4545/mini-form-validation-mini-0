(function () {
        "use strict";
        var form = document.getElementById("form"),
          mode = "signup",
          fields = ["name", "email", "password", "confirm"],
          state = {};
        function value(id) {
          return document.getElementById(id).value.trim();
        }
        function rules(id) {
          var v = value(id);
          if (id === "name") {
            if (!v) return "Enter your display name.";
            if (v.length < 2) return "Use at least 2 characters.";
            if (!/^[\p{L}\p{M} .'-]+$/u.test(v))
              return "Use letters, spaces, apostrophes or hyphens.";
          }
          if (id === "email") {
            if (!v) return "Enter your email address.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
              return "Enter a complete email such as you@example.com.";
          }
          if (id === "password") {
            if (!v) return "Enter a password.";
            if (mode === "signup" && v.length < 8)
              return "Use at least 8 characters.";
            if (
              (mode === "signup" && !/[a-z]/.test(v)) ||
              (mode === "signup" && !/[A-Z]/.test(v)) ||
              (mode === "signup" && !/\d/.test(v)) ||
              (mode === "signup" && !/[^A-Za-z0-9]/.test(v))
            )
              return "Add upper, lower, number and symbol.";
          }
          if (id === "confirm" && v !== value("password"))
            return "Passwords do not match.";
          return "";
        }
        function validate(id, show) {
          if (mode === "login" && (id === "name" || id === "confirm"))
            return true;
          var field = document.querySelector('[data-name="' + id + '"]'),
            error = rules(id);
          state[id] = !error;
          if (show) {
            field.classList.toggle("bad", !!error);
            field.classList.toggle("good", !error && !!value(id));
            field.querySelector(".error").textContent = error;
          }
          dev();
          return !error;
        }
        function dev() {
          document.getElementById("devState").textContent = JSON.stringify(
            { mode: mode, validity: state },
            null,
            2,
          );
        }
        function checks() {
          var v = value("password"),
            tests = [
              [v.length >= 8, "cLength"],
              [/[a-z]/.test(v) && /[A-Z]/.test(v), "cCase"],
              [/\d/.test(v), "cNumber"],
              [/[^A-Za-z0-9]/.test(v), "cSymbol"],
            ];
          tests.forEach(function (x) {
            var n = document.getElementById(x[1]);
            n.classList.toggle("ok", !!x[0]);
            n.textContent = (x[0] ? "✓ " : "○ ") + n.textContent.slice(2);
          });
        }
        function switchMode(next) {
          mode = next;
          document.querySelectorAll("[data-tab]").forEach(function (x) {
            x.classList.toggle("active", x.dataset.tab === mode);
          });
          document.querySelectorAll(".signup").forEach(function (x) {
            x.hidden = mode === "login";
          });
          document.querySelectorAll(".login").forEach(function (x) {
            x.hidden = mode !== "login";
          });
          document.getElementById("formTitle").textContent =
            mode === "signup" ? "Start your profile" : "Welcome back";
          document.getElementById("submit").textContent =
            mode === "signup" ? "Validate sign-up" : "Validate sign-in";
          document.getElementById("password").autocomplete =
            mode === "signup" ? "new-password" : "current-password";
          document.getElementById("summary").hidden = true;
          document.getElementById("notice").textContent = "";
          fields.forEach(function (x) {
            var f = document.querySelector('[data-name="' + x + '"]');
            f.classList.remove("bad", "good");
            f.querySelector(".error").textContent = "";
          });
          dev();
        }
        document.querySelectorAll("[data-tab]").forEach(function (x) {
          x.onclick = function () {
            switchMode(x.dataset.tab);
          };
        });
        fields.forEach(function (id) {
          var n = document.getElementById(id);
          n.addEventListener("blur", function () {
            validate(id, true);
          });
          n.addEventListener("input", function () {
            if (id === "password") checks();
            if (
              document
                .querySelector('[data-name="' + id + '"]')
                .classList.contains("bad")
            )
              validate(id, true);
          });
        });
        document.getElementById("show").onclick = function () {
          var p = document.getElementById("password"),
            on = p.type === "password";
          p.type = on ? "text" : "password";
          document.getElementById("show").textContent = on ? "Hide" : "Show";
        };
        form.onsubmit = function (ev) {
          ev.preventDefault();
          var active = mode === "signup" ? fields : ["email", "password"],
            bad = active.filter(function (id) {
              return !validate(id, true);
            });
          if (mode === "signup" && !document.getElementById("terms").checked)
            bad.push("terms");
          var summary = document.getElementById("summary");
          if (bad.length) {
            summary.hidden = false;
            summary.textContent =
              "Please fix " +
              bad.length +
              " highlighted item" +
              (bad.length > 1 ? "s" : "") +
              " before continuing.";
            summary.focus();
            document.getElementById("notice").textContent = "";
            return;
          }
          summary.hidden = true;
          if (mode === "login" && document.getElementById("remember").checked)
            try {
              localStorage.setItem("gateform:email", value("email"));
            } catch (x) {}
          document.getElementById("notice").textContent =
            "✓ Validation passed. Demo submission complete — nothing was sent.";
        };
        try {
          var remembered = localStorage.getItem("gateform:email");
          if (remembered) document.getElementById("email").value = remembered;
        } catch (x) {}
        checks();
        dev();
      })();
