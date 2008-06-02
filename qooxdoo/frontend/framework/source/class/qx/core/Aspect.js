/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Basis for Aspect Oriented features in qooxdoo.
 *
 * This class makes it possible to attach functions (aspects) before or
 * after each function call of any function defined in {@link qx.Class#define}.
 *
 * Classes, which define own aspects must add an explicit require to ths class
 * in the header comment using the following code:
 *
 * <pre>
 * &#35;require(qx.core.Aspect)
 * &#35;ignore(auto-require)
 * </pre>
 *
 * One example for a qooxdoo aspect is profiling ({@link qx.dev.Profile}).
 */
qx.Bootstrap.define("qx.core.Aspect",
{
  statics :
  {
    /** {Array} Registry for all known aspect wishes */
    __registry : [],


    /**
     * This function is used by {@link qx.Class#define} to wrap all statics, members and
     * constructors.
     *
     * @param fullName {String} Full name of the function including the class name.
     * @param type {String} Type of the wrapped function. One of "member", "static",
     *          "constructor", "destructor" or "property".
     * @param fcn {Function} function to wrap.
     *
     * @return {Function} wrapped function
     */
    wrap : function(fullName, fcn, type)
    {
      var before = [];
      var after = [];
      var reg = this.__registry;

      for (var i=0; i<reg.length; i++)
      {
        var aspect = reg[i];

        if ((type == aspect.type || aspect.type == "*") && fullName.match(aspect.re))
        {
          var pos = aspect.pos;

          if (pos == "before") {
            before.push(aspect.fcn);
          } else {
            after.push(aspect.fcn);
          }
        }
      }

      if (before.length == 0 && after.length == 0) {
        return fcn;
      }

      var wrapper = function()
      {
        for (var i=0; i<before.length; i++) {
          before[i].call(this, fullName, fcn, type, arguments);
        }

        var ret = fcn.apply(this, arguments);

        for (var i=0; i<after.length; i++) {
          after[i].call(this, fullName, fcn, type, arguments, ret);
        }

        return ret;
      }

      if (type != "static")
      {
        wrapper.self = fcn.self;
        wrapper.base = fcn.base;
      }

      fcn.wrapper = wrapper;
      return wrapper;
    },


    /**
     * Register a function to be called just before or after each time
     * one of the selected functions is called.
     *
     * @param position {String} One of "before" or "after". Whether the function
     *     should be called before or after the wrapped function.
     * @param type {String} Type of the wrapped function. One of "member",
     *     "static", "constructor", "destructor", "property" or "*".
     * @param nameRegExp {String|RegExp} Each function, with a full name matching
     *     this pattern (using <code>fullName.match(nameRegExp)</code>) will be
     *     wrapped.
     * @param fcn {Function} Function to be called just before or after any of the
     *     selected functions is called. If position is "before" the functions
     *     supports the same signature as {@link qx.dev.Profile#profileBefore}. If
     *     position is "after" it supports the same signature as
     *     {@link qx.dev.Profile#profileAfter}.
     */
    addAdvice : function(position, type, nameRegExp, fcn)
    {
      if (position !== "before" && position !== "after") {
        throw new Error("Unknown position: '" + position + "'");
      }

      this.__registry.push({
        pos: position,
        type: type,
        re: nameRegExp,
        fcn: fcn
      });
    }
  }
});
